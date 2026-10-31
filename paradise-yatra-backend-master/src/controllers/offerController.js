const Offer = require('../models/Offer');
const OfferBar = require('../models/OfferBar');

// Only internal paths ("/...") or http(s) URLs: blocks javascript: and the like
const isSafeLink = (url) => !url || /^\/(?!\/)/.test(url) || /^https?:\/\//i.test(url);

const OFFER_FIELDS = ['title', 'subtitle', 'imageUrl', 'linkUrl', 'type', 'discountText', 'validUntil', 'order', 'isActive'];
const BAR_FIELDS = ['isActive', 'label', 'message', 'linkUrl', 'ctaText', 'theme', 'startsAt', 'endsAt', 'showCountdown'];

const pick = (obj, keys) => keys.reduce((out, k) => (obj && obj[k] !== undefined ? { ...out, [k]: obj[k] } : out), {});

// "" / null clear a date; anything else must parse
const toDate = (value) => {
  if (value === '' || value === null) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw Object.assign(new Error('Invalid date.'), { status: 400 });
  return date;
};

const cleanOffer = (body) => {
  const data = pick(body, OFFER_FIELDS);
  if (typeof data.linkUrl === 'string') data.linkUrl = data.linkUrl.trim();
  if (!isSafeLink(data.linkUrl)) throw Object.assign(new Error('Link must start with "/" or "https://".'), { status: 400 });
  if (data.validUntil !== undefined) data.validUntil = toDate(data.validUntil);
  return data;
};

// ---------- Public ----------

// GET /api/offers: active offers that haven't expired, in display order
const getActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({ isActive: true, $or: [{ validUntil: null }, { validUntil: { $gt: now } }] })
      .sort({ order: 1, createdAt: -1 })
      .limit(12)
      .lean();
    res.json({ success: true, offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch offers.' });
  }
};

const publicBar = (bar) => ({
  label: bar.label,
  message: bar.message,
  linkUrl: bar.linkUrl,
  ctaText: bar.ctaText,
  theme: bar.theme,
  endsAt: bar.endsAt,
  showCountdown: bar.showCountdown,
  version: new Date(bar.updatedAt).getTime(),
});

// GET /api/offers/bar: the top bar if it is switched on and within its dates, else data: null
const getActiveBar = async (req, res) => {
  try {
    const bar = await OfferBar.findOne({ key: 'main' }).lean();
    const now = Date.now();
    const live =
      bar &&
      bar.isActive &&
      (bar.label || bar.message) &&
      (!bar.startsAt || new Date(bar.startsAt).getTime() <= now) &&
      (!bar.endsAt || new Date(bar.endsAt).getTime() > now);
    res.json({ success: true, data: live ? publicBar(bar) : null });
  } catch (error) {
    console.error('Error fetching offer bar:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch the offer bar.' });
  }
};

// ---------- Admin: offer cards ----------

const listOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ order: 1, createdAt: -1 }).lean();
    res.json({ success: true, offers });
  } catch (error) {
    console.error('Error listing offers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch offers.' });
  }
};

const createOffer = async (req, res) => {
  try {
    const offer = await Offer.create(cleanOffer(req.body));
    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    if (!error.status) console.error('Error creating offer:', error);
    res.status(400).json({ success: false, message: error.status ? error.message : 'Failed to create the offer. Check the required fields.' });
  }
};

const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, cleanOffer(req.body), { new: true, runValidators: true });
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found.' });
    res.json({ success: true, data: offer });
  } catch (error) {
    if (!error.status) console.error('Error updating offer:', error);
    res.status(400).json({ success: false, message: error.status ? error.message : 'Failed to update the offer.' });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found.' });
    res.json({ success: true, message: 'Deleted.' });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({ success: false, message: 'Failed to delete the offer.' });
  }
};

// ---------- Admin: top bar ----------

const getBarAdmin = async (req, res) => {
  try {
    const bar = await OfferBar.findOne({ key: 'main' }).lean();
    res.json({ success: true, data: bar || null });
  } catch (error) {
    console.error('Error fetching offer bar (admin):', error);
    res.status(500).json({ success: false, message: 'Failed to fetch the offer bar.' });
  }
};

const saveBar = async (req, res) => {
  try {
    const data = pick(req.body, BAR_FIELDS);
    if (typeof data.linkUrl === 'string') data.linkUrl = data.linkUrl.trim();
    if (!isSafeLink(data.linkUrl)) return res.status(400).json({ success: false, message: 'Link must start with "/" or "https://".' });
    if (data.startsAt !== undefined) data.startsAt = toDate(data.startsAt);
    if (data.endsAt !== undefined) data.endsAt = toDate(data.endsAt);
    if (data.startsAt && data.endsAt && data.startsAt >= data.endsAt) {
      return res.status(400).json({ success: false, message: 'The end time must be after the start time.' });
    }
    if (data.isActive && !String(data.label || '').trim() && !String(data.message || '').trim()) {
      return res.status(400).json({ success: false, message: 'Add a label or a message before switching the bar on.' });
    }
    const bar = await OfferBar.findOneAndUpdate(
      { key: 'main' },
      { $set: { ...data, updatedBy: { name: req.user.name, email: req.user.email } } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    res.json({ success: true, data: bar });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('Error saving offer bar:', error);
    res.status(400).json({ success: false, message: 'Failed to save the offer bar.' });
  }
};

module.exports = { getActiveOffers, getActiveBar, listOffers, createOffer, updateOffer, deleteOffer, getBarAdmin, saveBar };
