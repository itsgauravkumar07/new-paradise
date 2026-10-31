const mongoose = require('mongoose');
const ChatConversation = require('../models/ChatConversation');
const Lead = require('../models/Lead');
const { MAX_MESSAGES } = ChatConversation;

const escapeRegex = (v) => String(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SESSION_ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/;
const MAX_MESSAGES_PER_REQUEST = 50;

// --- tiny in-memory spam guard: max 60 sync requests per IP per 10 minutes ---
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 60;
const hits = new Map();
const tooManyRequests = (ip) => {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
};
setInterval(() => {
  const now = Date.now();
  for (const [ip, list] of hits) {
    const recent = list.filter((t) => now - t < WINDOW_MS);
    recent.length ? hits.set(ip, recent) : hits.delete(ip);
  }
}, WINDOW_MS).unref();

const toInt = (v, fallback, min, max) => {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

const cleanString = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const cleanMessages = (raw) =>
  (Array.isArray(raw) ? raw : [])
    .slice(0, MAX_MESSAGES_PER_REQUEST)
    .filter((m) => m && (m.role === 'user' || m.role === 'bot'))
    .map((m) => {
      const createdAt = new Date(m.createdAt);
      return {
        id: cleanString(m.id, 64) || undefined,
        role: m.role,
        kind: cleanString(m.kind, 30) || 'text',
        text: cleanString(m.text, 2000),
        createdAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
      };
    });

// POST /api/chat-conversations/:sessionId/messages  (public)
// Appends new messages to the session's transcript, creating it on first use.
const appendMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!SESSION_ID_PATTERN.test(sessionId || '')) {
      return res.status(400).json({ success: false, message: 'Invalid session id' });
    }

    const clientIp = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip;
    if (tooManyRequests(clientIp)) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
    }

    const b = req.body || {};
    let messages = cleanMessages(b.messages);

    // A retry can re-send messages that were already saved; skip ids we already have
    const incomingIds = messages.map((m) => m.id).filter(Boolean);
    if (incomingIds.length) {
      const existing = await ChatConversation.findOne(
        { sessionId, 'messages.id': { $in: incomingIds } },
        { 'messages.id': 1 }
      ).lean();
      if (existing) {
        const savedIds = new Set(existing.messages.map((m) => m.id));
        messages = messages.filter((m) => !m.id || !savedIds.has(m.id));
      }
    }

    const set = { lastMessageAt: new Date() };

    const contact = b.contact || {};
    const name = cleanString(contact.name, 100);
    const phone = cleanString(contact.phone, 20);
    const email = cleanString(contact.email, 120);
    if (name) set['contact.name'] = name;
    if (phone) set['contact.phone'] = phone;
    if (email) set['contact.email'] = email;
    if (b.leadId && mongoose.Types.ObjectId.isValid(b.leadId)) {
      set.leadId = b.leadId;
      set.status = 'lead';
    }

    if (messages.length === 0 && Object.keys(set).length === 1) {
      return res.status(400).json({ success: false, message: 'Nothing to save' });
    }

    const update = {
      $set: set,
      $setOnInsert: {
        sessionId,
        pageUrl: cleanString(b.pageUrl, 500),
        userAgent: cleanString(req.headers['user-agent'], 300),
        ip: clientIp,
      },
    };
    // Positive $slice keeps the first MAX_MESSAGES, so a runaway client can't grow the document forever
    if (messages.length) update.$push = { messages: { $each: messages, $slice: MAX_MESSAGES } };

    await ChatConversation.updateOne({ sessionId }, update, { upsert: true });
    return res.json({ success: true });
  } catch (error) {
    console.error('Error saving chat messages:', error);
    return res.status(500).json({ success: false, message: 'Failed to save chat messages' });
  }
};

// GET /api/chat-conversations  (admin)
const getConversations = async (req, res) => {
  try {
    const page = toInt(req.query.page, 1, 1, 10000);
    const limit = toInt(req.query.limit, 20, 1, 100);
    const match = {};

    if (['open', 'lead', 'closed'].includes(req.query.status)) match.status = req.query.status;

    const q = cleanString(req.query.q, 100);
    if (q) {
      const re = new RegExp(escapeRegex(q), 'i');
      match.$or = [{ 'contact.name': re }, { 'contact.phone': re }, { 'contact.email': re }, { 'messages.text': re }];
    }

    const [conversations, total] = await Promise.all([
      ChatConversation.aggregate([
        { $match: match },
        { $sort: { lastMessageAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $project: {
            sessionId: 1,
            contact: 1,
            leadId: 1,
            status: 1,
            pageUrl: 1,
            lastMessageAt: 1,
            createdAt: 1,
            messageCount: { $size: '$messages' },
            firstQuestion: {
              $let: {
                vars: {
                  firstUser: {
                    $arrayElemAt: [
                      { $filter: { input: '$messages', as: 'm', cond: { $eq: ['$$m.role', 'user'] } } },
                      0,
                    ],
                  },
                },
                in: '$$firstUser.text',
              },
            },
          },
        },
      ]),
      ChatConversation.countDocuments(match),
    ]);

    return res.json({ success: true, conversations, total, page, pageSize: limit });
  } catch (error) {
    console.error('Error fetching chat conversations:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch chat conversations' });
  }
};

// GET /api/chat-conversations/enquiries  (admin)
// Leads submitted through the chatbot, each with a summary of the chat that produced it.
const getChatbotEnquiries = async (req, res) => {
  try {
    const page = toInt(req.query.page, 1, 1, 10000);
    const limit = toInt(req.query.limit, 20, 1, 100);
    const match = { source: 'chatbot' };

    if (['new', 'contacted', 'qualified', 'lost', 'won'].includes(req.query.status)) match.status = req.query.status;

    const q = cleanString(req.query.q, 100);
    if (q) {
      const re = new RegExp(escapeRegex(q), 'i');
      match.$or = [{ fullName: re }, { phone: re }, { email: re }, { destination: re }];
    }

    const [leads, total] = await Promise.all([
      Lead.find(match).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Lead.countDocuments(match),
    ]);

    // Chats are linked by leadId; fall back to the phone number for chats whose link didn't save
    const conversations = leads.length
      ? await ChatConversation.find({
          $or: [{ leadId: { $in: leads.map((l) => l._id) } }, { 'contact.phone': { $in: leads.map((l) => l.phone) } }],
        })
          .select('leadId contact lastMessageAt messages.role')
          .sort({ lastMessageAt: -1 })
          .lean()
      : [];

    const enquiries = leads.map((lead) => {
      const conversation =
        conversations.find((c) => c.leadId && String(c.leadId) === String(lead._id)) ||
        conversations.find((c) => c.contact && c.contact.phone === lead.phone);
      return {
        ...lead,
        conversation: conversation
          ? {
              _id: conversation._id,
              messageCount: conversation.messages.length,
              lastMessageAt: conversation.lastMessageAt,
            }
          : null,
      };
    });

    return res.json({ success: true, enquiries, total, page, pageSize: limit });
  } catch (error) {
    console.error('Error fetching chatbot enquiries:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch chatbot enquiries' });
  }
};

// GET /api/chat-conversations/:id  (admin)
const getConversation = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }
    const conversation = await ChatConversation.findById(req.params.id).lean();
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
    return res.json({ success: true, conversation });
  } catch (error) {
    console.error('Error fetching chat conversation:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch chat conversation' });
  }
};

// DELETE /api/chat-conversations/:id  (admin)
const deleteConversation = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }
    const deleted = await ChatConversation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Conversation not found' });
    return res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error deleting chat conversation:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete chat conversation' });
  }
};

module.exports = { appendMessages, getConversations, getChatbotEnquiries, getConversation, deleteConversation };
