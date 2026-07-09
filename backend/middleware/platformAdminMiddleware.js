const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ensure this token belongs to the platform owner
    if (decoded.scope !== 'platform_owner') {
      return res.status(403).json({ success: false, message: 'Access denied: Platform Owner only' });
    }
    
    req.platformAdmin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};
