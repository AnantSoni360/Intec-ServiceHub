const jwt = require('jsonwebtoken');

// Verifies a short-lived JWT issued by POST /api/admin/login.
// Deliberately separate from authMiddleware/roleMiddleware: tenant roles
// (Admin/super_admin) are scoped to a single company and must never be
// treated as platform-owner access.
const platformAdminMiddleware = (req, res, next) => {
  let token;
  const authHeader = req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied. No token provided.' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured on the server.');
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified.scope !== 'platform_owner') {
      return res.status(403).json({ success: false, message: 'Access Denied.' });
    }
    req.platformAdmin = verified;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = platformAdminMiddleware;
