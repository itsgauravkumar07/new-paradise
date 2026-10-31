const mongoose = require('mongoose');

// Transcript of one website chatbot session (one browser = one sessionId).
const MAX_MESSAGES = 300;

const chatMessageSchema = new mongoose.Schema({
  id: { type: String, trim: true, maxlength: 64 }, // client-side message id, used to ignore re-sent messages
  role: { type: String, enum: ['user', 'bot'], required: true },
  kind: { type: String, trim: true, maxlength: 30, default: 'text' }, // text, packages, faq, lead, handoff...
  text: { type: String, maxlength: 2000, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const chatConversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  messages: { type: [chatMessageSchema], default: [] },
  contact: {
    name: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
  },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
  pageUrl: { type: String, trim: true, maxlength: 500, default: '' },
  userAgent: { type: String, trim: true, maxlength: 300, default: '' },
  ip: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['open', 'lead', 'closed'], default: 'open' },
  lastMessageAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

module.exports = mongoose.model('ChatConversation', chatConversationSchema);
module.exports.MAX_MESSAGES = MAX_MESSAGES;
