const mongoose = require('mongoose');
const FDExperience = require('../models/FDExperience');

const escapeRegex = (v) => String(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toInt = (v, fallback, min, max) => {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

const cleanStrings = (value, max) =>
  (Array.isArray(value) ? value : [])
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean)
    .slice(0, max);

// Only the fields an admin may set; everything else in the body is ignored
const pickFields = (b = {}) => {
  const data = {};
  ['title', 'destination', 'tripDate', 'duration', 'coverImage', 'story', 'videoUrl'].forEach((k) => {
    if (b[k] !== undefined) data[k] = typeof b[k] === 'string' ? b[k].trim() : b[k];
  });
  if (b.groupSize !== undefined) data.groupSize = Math.max(0, parseInt(b.groupSize, 10) || 0);
  if (b.order !== undefined) data.order = parseInt(b.order, 10) || 0;
  if (b.isActive !== undefined) data.isActive = b.isActive === true || b.isActive === 'true';
  if (b.gallery !== undefined) data.gallery = cleanStrings(b.gallery, 12);
  if (b.highlights !== undefined) data.highlights = cleanStrings(b.highlights, 8);
  if (b.fixedDeparture !== undefined) {
    data.fixedDeparture = mongoose.Types.ObjectId.isValid(b.fixedDeparture) ? b.fixedDeparture : null;
  }
  if (b.reviews !== undefined) {
    data.reviews = (Array.isArray(b.reviews) ? b.reviews : [])
      .filter((r) => r && typeof r.name === 'string' && r.name.trim() && typeof r.text === 'string' && r.text.trim())
      .slice(0, 20)
      .map((r) => ({
        name: r.name.trim(),
        location: typeof r.location === 'string' ? r.location.trim() : '',
        rating: Math.min(5, Math.max(1, parseInt(r.rating, 10) || 5)),
        text: r.text.trim(),
        photo: typeof r.photo === 'string' ? r.photo.trim() : '',
      }));
  }
  return data;
};

const sendError = (res, error, fallback) => {
  if (error && error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: Object.values(error.errors)[0]?.message || error.message });
  }
  console.error(fallback, error);
  return res.status(500).json({ success: false, message: fallback });
};

// GET /api/fd-experiences  (public)
// ?destination=  matches the trip's destination (case-insensitive); ?limit= (default 12, max 50)
const getPublicExperiences = async (req, res) => {
  try {
    const limit = toInt(req.query.limit, 12, 1, 50);
    const query = { isActive: true };
    if (req.query.destination) {
      query.destination = { $regex: escapeRegex(String(req.query.destination).trim().slice(0, 100)), $options: 'i' };
    }
    const experiences = await FDExperience.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ success: true, experiences });
  } catch (error) {
    sendError(res, error, 'Failed to load past trips');
  }
};

// GET /api/fd-experiences/admin/all  (staff)
const getAllExperiences = async (req, res) => {
  try {
    const experiences = await FDExperience.find({})
      .sort({ order: 1, createdAt: -1 })
      .populate('fixedDeparture', 'title slug')
      .lean();
    res.json({ success: true, experiences });
  } catch (error) {
    sendError(res, error, 'Failed to load past trips');
  }
};

// POST /api/fd-experiences  (staff)
const createExperience = async (req, res) => {
  try {
    const experience = await FDExperience.create(pickFields(req.body));
    res.status(201).json({ success: true, data: experience });
  } catch (error) {
    sendError(res, error, 'Failed to create the trip');
  }
};

// PUT /api/fd-experiences/:id  (staff)
const updateExperience = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }
    const experience = await FDExperience.findByIdAndUpdate(req.params.id, pickFields(req.body), {
      new: true,
      runValidators: true,
    });
    if (!experience) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, data: experience });
  } catch (error) {
    sendError(res, error, 'Failed to update the trip');
  }
};

// DELETE /api/fd-experiences/:id  (staff)
const deleteExperience = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }
    const experience = await FDExperience.findByIdAndDelete(req.params.id);
    if (!experience) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, message: 'Trip deleted' });
  } catch (error) {
    sendError(res, error, 'Failed to delete the trip');
  }
};

module.exports = {
  getPublicExperiences,
  getAllExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
};
