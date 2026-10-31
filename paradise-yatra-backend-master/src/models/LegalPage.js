const mongoose = require("mongoose");

// Content of the website's legal pages (Privacy, Terms, Cookie, Refund), edited in Admin → Legal Pages.
// One document per page. Section blocks are validated and cleaned by the controller before saving
// (see sanitizeLegalPage), so they are stored as plain objects.
// The frontend shows its built-in wording for a page until a document for it exists.

const LEGAL_KINDS = ["privacy", "terms", "cookie", "refund"];

const glanceSchema = new mongoose.Schema(
  {
    icon: { type: String, default: "" },
    title: { type: String, default: "" },
    text: { type: String, default: "" },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    icon: { type: String, default: "" },
    blocks: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

const legalPageSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: LEGAL_KINDS, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    // Date shown on the page as "Last updated" (yyyy-mm-dd), set by the legal team
    lastUpdated: { type: String, required: true },
    glance: { type: [glanceSchema], default: [] },
    sections: { type: [sectionSchema], default: [] },
    updatedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      email: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LegalPage", legalPageSchema);
module.exports.LEGAL_KINDS = LEGAL_KINDS;
