const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/auth");
const { auth } = require("../middleware/auth");
const { internalServiceAuth } = require("../middleware/internalServiceAuth");
const {
  createPurchase,
  markPurchasePaid,
  markPurchaseFailed,
  markPurchaseRefunded,
  getAllPurchases,
  getMyPurchases,
} = require("../controllers/purchaseController");

// Public/internal routes (called from trusted server-side API routes)
router.post("/", internalServiceAuth, createPurchase);
router.post("/mark-paid", internalServiceAuth, markPurchasePaid);
router.post("/mark-failed", internalServiceAuth, markPurchaseFailed);
router.post("/mark-refunded", internalServiceAuth, markPurchaseRefunded);

// Admin route
router.get("/my", auth, getMyPurchases);
router.get("/", adminAuth, getAllPurchases);

module.exports = router;
