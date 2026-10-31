const mongoose = require("mongoose");

// Every published version of a legal page, so the legal team can see who changed what and when,
// and bring back earlier wording. The newest revisions are kept (see MAX_REVISIONS in the controller).
const legalPageRevisionSchema = new mongoose.Schema(
  {
    kind: { type: String, required: true, index: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    changeNote: { type: String, default: "" },
    savedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      email: String,
      role: String,
    },
  },
  { timestamps: true }
);

legalPageRevisionSchema.index({ kind: 1, createdAt: -1 });

module.exports = mongoose.model("LegalPageRevision", legalPageRevisionSchema);
