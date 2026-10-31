const CustomerMoment = require('../models/CustomerMoment');

const FIELDS = ['type', 'imageUrl', 'videoUrl', 'customerName', 'location', 'tripDate', 'quote', 'showOnHome', 'consent', 'order', 'isActive'];

const pick = (obj, keys) => keys.reduce((out, k) => (obj && obj[k] !== undefined ? { ...out, [k]: obj[k] } : out), {});
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Site paths ("/Home/...") or https links only: blocks javascript: and the like
const isSafeUrl = (url) => !url || /^\/(?!\/)/.test(url) || /^https:\/\//i.test(url);
const isYouTube = (url) => /(?:youtube\.com|youtu\.be)\//i.test(url);
const isInstagram = (url) => /instagram\.com\/(?:reel|reels|p|tv)\//i.test(url);
const isVideoFile = (url) => /\.(mp4|webm|mov)(?:[?#].*)?$/i.test(url);

const invalid = (message) => Object.assign(new Error(message), { status: 400 });

// Checks a full item (after merging an update onto the saved one)
const validate = (item) => {
  if (!['photo', 'video'].includes(item.type)) throw invalid('Choose photo or video.');
  if (!String(item.customerName || '').trim()) throw invalid("Add the customer's name.");
  if (!isSafeUrl(item.imageUrl) || !isSafeUrl(item.videoUrl)) throw invalid('Links must start with "https://" (or "/" for files on this site).');
  if (item.type === 'photo' && !item.imageUrl) throw invalid('Upload the photo.');
  if (item.type === 'video') {
    if (!item.videoUrl) throw invalid('Add the video link.');
    if (!isYouTube(item.videoUrl) && !isInstagram(item.videoUrl) && !isVideoFile(item.videoUrl)) {
      throw invalid('Use a YouTube or Instagram link, or a direct .mp4 video link.');
    }
    if (isInstagram(item.videoUrl) && !item.imageUrl) throw invalid('Instagram videos need a cover image.');
  }
  if (item.consent !== true) throw invalid('Confirm that the customer agreed to share this.');
};

// ---------- Public ----------

// GET /api/customer-moments?location=Kerala&home=1&type=video&limit=12
const getMoments = async (req, res) => {
  try {
    const filter = { isActive: true, consent: true };
    const location = typeof req.query.location === 'string' ? req.query.location.trim() : '';
    if (location) filter.location = new RegExp(`^${escapeRegex(location)}$`, 'i');
    if (req.query.home === '1') filter.showOnHome = true;
    if (req.query.type === 'photo' || req.query.type === 'video') filter.type = req.query.type;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 60, 1), 120);

    const moments = await CustomerMoment.find(filter, { consent: 0, isActive: 0, __v: 0 })
      .sort({ order: 1, createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ success: true, moments });
  } catch (error) {
    console.error('Error fetching customer moments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch traveller moments.' });
  }
};

// ---------- Admin ----------

const listMoments = async (req, res) => {
  try {
    const moments = await CustomerMoment.find().sort({ order: 1, createdAt: -1 }).lean();
    res.json({ success: true, moments });
  } catch (error) {
    console.error('Error listing customer moments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch the gallery.' });
  }
};

const createMoment = async (req, res) => {
  try {
    const data = pick(req.body, FIELDS);
    validate(data);
    const moment = await CustomerMoment.create(data);
    res.status(201).json({ success: true, data: moment });
  } catch (error) {
    if (!error.status) console.error('Error creating customer moment:', error);
    res.status(400).json({ success: false, message: error.status ? error.message : 'Failed to save. Check the required fields.' });
  }
};

const updateMoment = async (req, res) => {
  try {
    const existing = await CustomerMoment.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ success: false, message: 'Not found.' });
    const data = pick(req.body, FIELDS);
    validate({ ...existing, ...data });
    const moment = await CustomerMoment.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ success: true, data: moment });
  } catch (error) {
    if (error.name === 'CastError') return res.status(404).json({ success: false, message: 'Not found.' });
    if (!error.status) console.error('Error updating customer moment:', error);
    res.status(400).json({ success: false, message: error.status ? error.message : 'Failed to update.' });
  }
};

const deleteMoment = async (req, res) => {
  try {
    const moment = await CustomerMoment.findByIdAndDelete(req.params.id);
    if (!moment) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, message: 'Deleted.' });
  } catch (error) {
    console.error('Error deleting customer moment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete.' });
  }
};

module.exports = { getMoments, listMoments, createMoment, updateMoment, deleteMoment };
