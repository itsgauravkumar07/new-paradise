const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String },
    userEmail: { type: String },
    userRole: { type: String },
    action: { type: String, enum: ["create", "update"], required: true },
    section: { type: String, required: true }, // e.g. "packages", "blogs", "faq"
    documentId: { type: String },
    method: { type: String },
    path: { type: String },
    // The response the write produced - not a full before/after diff, just
    // a record of what the document looked like right after the change.
    resultSnapshot: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);