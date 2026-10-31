const internalServiceAuth = (req, res, next) => {
  const expectedToken = process.env.INTERNAL_API_TOKEN;
  const providedToken = req.header("x-internal-token");

  // Local/dev fallback to avoid blocking development when token is not configured.
  if (!expectedToken) {
    if (process.env.NODE_ENV !== "production") {
      return next();
    }
    return res.status(500).json({
      success: false,
      message: "Internal service token is not configured",
    });
  }

  if (!providedToken || providedToken !== expectedToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized internal service request",
    });
  }

  next();
};

module.exports = { internalServiceAuth };
