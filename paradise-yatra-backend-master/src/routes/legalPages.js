const express = require("express");
const router = express.Router();
const { requireRole } = require("../middleware/auth");
const auditLogger = require("../middleware/auditLogger");
const { SECTION_PERMISSIONS } = require("../config/roles");
const {
  getLegalPage,
  listLegalPages,
  getLegalPageAdmin,
  saveLegalPage,
  listRevisions,
  getRevision,
} = require("../controllers/legalPageController");

const legalTeam = requireRole(SECTION_PERMISSIONS.legalPages);

// Admin (legal team and admin). Declared before "/:kind" so "admin" isn't taken as a page name.
router.get("/admin/list", legalTeam, listLegalPages);
router.get("/admin/revisions/:id", legalTeam, getRevision);
router.get("/admin/:kind/revisions", legalTeam, listRevisions);
router.get("/admin/:kind", legalTeam, getLegalPageAdmin);
router.put("/:kind", legalTeam, auditLogger("legal-pages"), saveLegalPage);

// Public
router.get("/:kind", getLegalPage);

module.exports = router;
