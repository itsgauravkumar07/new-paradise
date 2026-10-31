const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const HotelEnquiry = require('../models/HotelEnquiry');
const { ENQUIRY_STATUSES } = HotelEnquiry;

const escapeRegex = (v) => String(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// --- tiny in-memory spam guard: max 5 enquiries per IP per hour ---
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
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

const parseDate = (v) => {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const toInt = (v, fallback, min, max) => {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

// POST /api/hotels/enquiries  (public)
const createEnquiry = async (req, res) => {
  try {
    const b = req.body || {};

    // Honeypot: real visitors never fill this hidden field. Pretend success to bots.
    if (b.website) return res.status(201).json({ success: true, message: 'Enquiry received.' });

    const str = (v) => (typeof v === 'string' ? v.trim() : '');
    const name = str(b.name);
    const phone = str(b.phone);
    const email = str(b.email).toLowerCase();
    const message = str(b.message);

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ success: false, message: 'Please enter your full name.' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Enter a 10-digit phone number.' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    if (message.length > 1000) {
      return res.status(400).json({ success: false, message: 'Message is too long (max 1000 characters).' });
    }

    const checkIn = parseDate(b.checkIn);
    const checkOut = parseDate(b.checkOut);
    if (checkIn === null || checkOut === null) {
      return res.status(400).json({ success: false, message: 'Invalid check-in or check-out date.' });
    }
    if (checkIn && checkOut && checkOut <= checkIn) {
      return res.status(400).json({ success: false, message: 'Check-out must be after check-in.' });
    }
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (checkIn && checkIn < new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000)) {
      return res.status(400).json({ success: false, message: 'Check-in date cannot be in the past.' });
    }

    // Only valid submissions count towards the limit, so typos never lock a real visitor out.
    const clientIp = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip;
    if (tooManyRequests(clientIp)) {
      return res.status(429).json({ success: false, message: 'Too many enquiries. Please try again later or call us.' });
    }

    // Hotel details come from our database, not from what the browser claims.
    let hotelFields = {};
    if (b.hotelSlug) {
      const hotel = typeof b.hotelSlug === 'string' ? await Hotel.findOne({ slug: b.hotelSlug, isActive: true }) : null;
      if (hotel) hotelFields = { hotel: hotel._id, hotelName: hotel.name, hotelSlug: hotel.slug, city: hotel.city };
    }

    const enquiry = await HotelEnquiry.create({
      ...hotelFields,
      name,
      phone,
      email,
      checkIn,
      checkOut,
      adults: toInt(b.adults, 2, 1, 10),
      children: toInt(b.children, 0, 0, 12),
      rooms: toInt(b.rooms, 1, 1, 6),
      message,
      source: 'hotel-page',
    });

    // The Next.js proxy reads `enquiry` to email the team, then strips it before replying to the visitor.
    res.status(201).json({ success: true, message: 'Enquiry received.', id: enquiry._id, enquiry: enquiry.toObject() });
  } catch (error) {
    console.error('Hotel enquiry submission error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

// GET /api/hotels/enquiries  (admin)
const listEnquiries = async (req, res) => {
  try {
    const { status, q, limit, page } = req.query;
    const filter = {};
    if (status && ENQUIRY_STATUSES.includes(status)) filter.status = status;
    if (q && String(q).trim()) {
      const rx = new RegExp(escapeRegex(String(q).trim()), 'i');
      filter.$or = [{ name: rx }, { phone: rx }, { email: rx }, { hotelName: rx }, { city: rx }];
    }
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

    const [items, total, counts] = await Promise.all([
      HotelEnquiry.find(filter).sort({ submittedAt: -1 }).skip((pageNum - 1) * pageSize).limit(pageSize),
      HotelEnquiry.countDocuments(filter),
      HotelEnquiry.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    ]);
    const statusCounts = { new: 0, contacted: 0, booked: 0, closed: 0 };
    counts.forEach((c) => { if (c._id in statusCounts) statusCounts[c._id] = c.n; });

    res.json({ success: true, data: items, total, page: pageNum, pageSize, statusCounts });
  } catch (error) {
    console.error('Error listing hotel enquiries:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch enquiries.' });
  }
};

// PATCH /api/hotels/enquiries/:id  (admin) - status and/or notes
const updateEnquiry = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid id.' });
    }
    const update = {};
    if (req.body.status !== undefined) {
      if (!ENQUIRY_STATUSES.includes(req.body.status)) {
        return res.status(400).json({ success: false, message: 'Invalid status.' });
      }
      update.status = req.body.status;
    }
    if (req.body.adminNotes !== undefined) {
      update.adminNotes = String(req.body.adminNotes).slice(0, 2000);
    }
    if (!Object.keys(update).length) {
      return res.status(400).json({ success: false, message: 'Nothing to update.' });
    }
    const item = await HotelEnquiry.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Error updating hotel enquiry:', error);
    res.status(500).json({ success: false, message: 'Failed to update enquiry.' });
  }
};

// DELETE /api/hotels/enquiries/:id  (admin)
const deleteEnquiry = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid id.' });
    }
    const item = await HotelEnquiry.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    res.json({ success: true, message: 'Enquiry deleted.' });
  } catch (error) {
    console.error('Error deleting hotel enquiry:', error);
    res.status(500).json({ success: false, message: 'Failed to delete enquiry.' });
  }
};

module.exports = { createEnquiry, listEnquiries, updateEnquiry, deleteEnquiry };
