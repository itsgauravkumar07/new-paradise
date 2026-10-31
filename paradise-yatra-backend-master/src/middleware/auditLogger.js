const AuditLog = require("../models/AuditLog");

// Logs every successful create/update made by a non-admin staff account.
// Admins aren't logged - this exists to give visibility into staff changes,
// not to track the owner's own actions.
//
// Usage: router.post("/", requireRole([...]), auditLogger("packages"), handler)
// Must come AFTER the auth middleware (needs req.user) and BEFORE the
// actual route handler, since it wraps res.json to capture the result.
const auditLogger = (section) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      // Fire-and-forget: never let logging failures affect the actual response.
      if (
        req.user &&
        req.user.role !== "admin" &&
        res.statusCode >= 200 &&
        res.statusCode < 300
      ) {
        const action = req.method === "POST" ? "create" : "update";
        const documentId =
          req.params?.id || body?.data?._id || body?._id || body?.user?._id;

        AuditLog.create({
          userId: req.user._id,
          userName: req.user.name,
          userEmail: req.user.email,
          userRole: req.user.role,
          action,
          section,
          documentId,
          method: req.method,
          path: req.originalUrl,
          resultSnapshot: body,
        }).catch((err) => {
          console.error("Audit log write failed:", err.message);
        });
      }

      return originalJson(body);
    };

    next();
  };
};

module.exports = auditLogger;