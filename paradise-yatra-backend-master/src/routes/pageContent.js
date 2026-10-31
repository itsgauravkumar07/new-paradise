const express = require('express');
const router = express.Router();
const PageContent = require('../models/PageContent');
const { auth, adminAuth } = require('../middleware/auth');

// @route   GET /api/page-content
// @desc    Get all page content
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;

    const content = await PageContent.find(filter).sort('-createdAt');
    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Error in GET /api/page-content:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/page-content/all (admin)
// @desc    Get all page content including inactive
// @access  Private/Admin
router.get('/all', auth, adminAuth, async (req, res) => {
  try {
    const content = await PageContent.find().sort('-createdAt');
    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Error in GET /api/page-content/all:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/page-content/:key
// @desc    Get page content by key
// @access  Public
router.get('/:key', async (req, res) => {
  try {
    const content = await PageContent.findOne({ key: req.params.key.toLowerCase(), isActive: true });
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Error in GET /api/page-content/:key:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   POST /api/page-content
// @desc    Create new page content
// @access  Private/Admin
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { type, key, title, content, image, isActive } = req.body;

    const existingContent = await PageContent.findOne({ key: key.toLowerCase() });
    if (existingContent) {
      return res.status(400).json({ success: false, message: 'Content with this key already exists' });
    }

    const pageContent = await PageContent.create({
      type,
      key: key.toLowerCase(),
      title,
      content,
      image,
      isActive
    });

    res.status(201).json({ success: true, data: pageContent });
  } catch (error) {
    console.error('Error in POST /api/page-content:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/page-content/:id
// @desc    Update page content
// @access  Private/Admin
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { type, key, title, content, image, isActive } = req.body;

    let pageContent = await PageContent.findById(req.params.id);
    if (!pageContent) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // Check if key is being updated to an existing key
    if (key && key.toLowerCase() !== pageContent.key) {
      const existingKey = await PageContent.findOne({ key: key.toLowerCase() });
      if (existingKey) {
        return res.status(400).json({ success: false, message: 'Content with this key already exists' });
      }
      pageContent.key = key.toLowerCase();
    }

    if (type) pageContent.type = type;
    if (title !== undefined) pageContent.title = title;
    if (content) pageContent.content = content;
    if (image !== undefined) pageContent.image = image;
    if (isActive !== undefined) pageContent.isActive = isActive;

    await pageContent.save();
    res.json({ success: true, data: pageContent });
  } catch (error) {
    console.error('Error in PUT /api/page-content/:id:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   DELETE /api/page-content/:id
// @desc    Delete page content
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const pageContent = await PageContent.findById(req.params.id);
    if (!pageContent) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    await pageContent.deleteOne();
    res.json({ success: true, message: 'Content removed' });
  } catch (error) {
    console.error('Error in DELETE /api/page-content/:id:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
