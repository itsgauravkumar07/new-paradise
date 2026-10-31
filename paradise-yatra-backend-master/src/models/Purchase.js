const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    internalOrderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: String,
      required: false,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    packageId: {
      type: String,
      required: false,
      trim: true,
    },
    packageSlug: {
      type: String,
      required: true,
      trim: true,
    },
    packageTitle: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: false,
      trim: true,
    },
    travelDate: {
      type: String,
      required: false,
      trim: true,
    },
    travellers: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    unitLabel: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
      trim: true,
      uppercase: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },
    razorpaySignature: {
      type: String,
      required: false,
      trim: true,
    },
    notes: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
      index: true,
    },
    paidAt: {
      type: Date,
      required: false,
    },
    paymentMethod: {
      type: String,
      required: false,
      trim: true,
    },
    failedAt: {
      type: Date,
      required: false,
    },
    failureReason: {
      type: String,
      required: false,
      trim: true,
    },
    refundId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },
    refundedAmount: {
      type: Number,
      required: false,
      min: 0,
    },
    refundedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

purchaseSchema.index({ email: 1, createdAt: -1 });
purchaseSchema.index({ userId: 1, createdAt: -1 });
purchaseSchema.index({ packageId: 1, createdAt: -1 });
purchaseSchema.index({ packageSlug: 1, createdAt: -1 });
purchaseSchema.index({ internalOrderId: 1 });
purchaseSchema.index({ receiptNumber: 1 });
purchaseSchema.index({ razorpayOrderId: 1 });

module.exports = mongoose.model("Purchase", purchaseSchema);
