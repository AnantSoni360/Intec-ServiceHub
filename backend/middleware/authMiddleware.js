const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
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
    
    // Check tokenVersion
    const user = await User.findById(verified.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }
    
    if (user.tokenVersion !== verified.tokenVersion) {
      return res.status(401).json({ success: false, message: 'Token has been revoked or expired.' });
    }

    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
