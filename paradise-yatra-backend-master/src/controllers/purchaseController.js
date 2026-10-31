const Purchase = require("../models/Purchase");

const pad = (num, len = 6) => String(num).padStart(len, "0");

const generateInternalOrderId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const unixPart = String(Date.now()).slice(-6);
  return `PYO-${year}-${pad(unixPart, 6)}`;
};

const generateReceiptNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const unixPart = String(Date.now()).slice(-6);
  return `PYR-${year}${month}${day}-${pad(unixPart, 6)}`;
};

const findPurchase = async (purchaseId, razorpayOrderId) => {
  if (purchaseId) {
    const byId = await Purchase.findById(purchaseId);
    if (byId) return byId;
  }
  if (razorpayOrderId) {
    return Purchase.findOne({ razorpayOrderId });
  }
  return null;
};

const createPurchase = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      email,
      phone,
      packageId,
      packageSlug,
      packageTitle,
      destination,
      travelDate,
      travellers,
      unitPrice,
      unitLabel,
      amount,
      currency = "INR",
      razorpayOrderId,
      notes,
    } = req.body;

    const required = {
      fullName,
      email,
      phone,
      packageSlug,
      packageTitle,
      travellers,
      unitPrice,
      unitLabel,
      amount,
      razorpayOrderId,
    };

    for (const [key, value] of Object.entries(required)) {
      if (value === undefined || value === null || value === "") {
        return res.status(400).json({ success: false, message: `${key} is required` });
      }
    }

    const existing = await Purchase.findOne({ razorpayOrderId });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Purchase already exists for this Razorpay order",
        data: existing,
      });
    }

    const purchase = new Purchase({
      internalOrderId: generateInternalOrderId(),
      receiptNumber: generateReceiptNumber(),
      userId,
      fullName,
      email,
      phone,
      packageId: packageId ? String(packageId).trim() : "",
      packageSlug,
      packageTitle,
      destination,
      travelDate,
      travellers: Number(travellers),
      unitPrice: Number(unitPrice),
      unitLabel,
      amount: Number(amount),
      currency,
      razorpayOrderId,
      notes,
      status: "created",
    });

    await purchase.save();

    return res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      data: purchase,
    });
  } catch (error) {
    console.error("createPurchase error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create purchase",
      error: error.message,
    });
  }
};

const markPurchasePaid = async (req, res) => {
  try {
    const {
      purchaseId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment fields",
      });
    }

    const purchase = await findPurchase(purchaseId, razorpayOrderId);

    if (!purchase) {
      return res.status(404).json({ success: false, message: "Purchase not found" });
    }

    if (purchase.status !== "paid") {
      purchase.status = "paid";
      purchase.razorpayPaymentId = razorpayPaymentId;
      purchase.razorpaySignature = razorpaySignature;
      purchase.paymentMethod = paymentMethod || purchase.paymentMethod;
      purchase.paidAt = new Date();
      purchase.failedAt = undefined;
      purchase.failureReason = "";
      await purchase.save();
    }

    return res.status(200).json({
      success: true,
      message: "Purchase marked as paid",
      data: purchase,
    });
  } catch (error) {
    console.error("markPurchasePaid error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update purchase status",
      error: error.message,
    });
  }
};

const markPurchaseFailed = async (req, res) => {
  try {
    const {
      purchaseId,
      razorpayOrderId,
      razorpayPaymentId,
      failureReason,
      failureCode,
      failureSource,
      failureStep,
      paymentMethod,
    } = req.body;

    if (!purchaseId && !razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "purchaseId or razorpayOrderId is required",
      });
    }

    const purchase = await findPurchase(purchaseId, razorpayOrderId);

    if (!purchase) {
      return res.status(404).json({ success: false, message: "Purchase not found" });
    }

    if (purchase.status !== "refunded" && purchase.status !== "paid") {
      const reasonParts = [failureReason, failureCode, failureSource, failureStep].filter(Boolean);

      purchase.status = "failed";
      purchase.failedAt = new Date();
      purchase.failureReason = reasonParts.join(" | ").slice(0, 500);
      purchase.razorpayPaymentId = razorpayPaymentId || purchase.razorpayPaymentId;
      purchase.paymentMethod = paymentMethod || purchase.paymentMethod;
      await purchase.save();
    }

    return res.status(200).json({
      success: true,
      message: "Purchase marked as failed",
      data: purchase,
    });
  } catch (error) {
    console.error("markPurchaseFailed error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update purchase status",
      error: error.message,
    });
  }
};

const markPurchaseRefunded = async (req, res) => {
  try {
    const {
      purchaseId,
      razorpayOrderId,
      refundId,
      refundedAmount,
      paymentMethod,
      notes,
    } = req.body;

    if (!purchaseId && !razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "purchaseId or razorpayOrderId is required",
      });
    }

    const purchase = await findPurchase(purchaseId, razorpayOrderId);

    if (!purchase) {
      return res.status(404).json({ success: false, message: "Purchase not found" });
    }

    if (purchase.status !== "refunded") {
      purchase.status = "refunded";
      purchase.refundId = refundId || purchase.refundId;
      purchase.refundedAmount =
        Number.isFinite(Number(refundedAmount)) && Number(refundedAmount) >= 0
          ? Number(refundedAmount)
          : purchase.amount;
      purchase.refundedAt = new Date();
      purchase.paymentMethod = paymentMethod || purchase.paymentMethod;
      if (notes) {
        purchase.notes = `${purchase.notes || ""}\nRefund: ${String(notes)}`.trim();
      }
      await purchase.save();
    }

    return res.status(200).json({
      success: true,
      message: "Purchase marked as refunded",
      data: purchase,
    });
  } catch (error) {
    console.error("markPurchaseRefunded error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update purchase status",
      error: error.message,
    });
  }
};

const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: purchases });
  } catch (error) {
    console.error("getAllPurchases error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchases",
      error: error.message,
    });
  }
};

const getMyPurchases = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = String(req.user._id || "");
    const email = String(req.user.email || "").trim().toLowerCase();

    const filters = [];
    if (userId) filters.push({ userId });
    if (email) filters.push({ email });

    if (filters.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Unable to identify user for purchases.",
      });
    }

    const purchases = await Purchase.find({ $or: filters }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: purchases });
  } catch (error) {
    console.error("getMyPurchases error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your purchases",
      error: error.message,
    });
  }
};

module.exports = {
  createPurchase,
  markPurchasePaid,
  markPurchaseFailed,
  markPurchaseRefunded,
  getAllPurchases,
  getMyPurchases,
};
