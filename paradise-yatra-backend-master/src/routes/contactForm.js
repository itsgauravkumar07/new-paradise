const express = require("express");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const { adminAuth } = require("../middleware/auth");

const router = express.Router();

const VALID_STATUSES = ["new", "read", "resolved"];

// POST /api/contact-form - save contact form submissions (public, unchanged)
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message, source } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Full name is required." });
    }
    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ message: "Phone number is required." });
    }
    if (!subject || !String(subject).trim()) {
      return res.status(400).json({ message: "Query type is required." });
    }

    const db = mongoose.connection.db;
    const collection = db.collection("contact-form");

    const payload = {
      name: String(name).trim(),
      email: email ? String(email).trim().toLowerCase() : "",
      phone: String(phone).trim(),
      subject: String(subject).trim(),
      message: message ? String(message).trim() : "",
      source: source || "contact-page",
      status: "new",
      submittedAt: new Date(),
    };

    const result = await collection.insertOne(payload);

    return res.status(201).json({
      message: "Contact form submitted successfully.",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Contact form submission error:", error);
    return res.status(500).json({ message: "Internal server error. Please try again." });
  }
});

// GET /api/contact-form - list submissions (admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection("contact-form");

    const { status, q, limit, page } = req.query;

    const filter = {};
    if (status && VALID_STATUSES.includes(status)) {
      filter.status = status;
    }
    if (q && String(q).trim()) {
      const searchRegex = new RegExp(String(q).trim(), "i");
      filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

    const [items, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ submittedAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      total,
      page: pageNum,
      pageSize,
    });
  } catch (error) {
    console.error("Error fetching contact form submissions:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// PATCH /api/contact-form/:id/status - update status (admin only)
router.patch("/:id/status", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id." });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const db = mongoose.connection.db;
    const collection = db.collection("contact-form");

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating contact form status:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;