const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received for:', req.body.email);
    const { email, password } = req.body;
    const bcrypt = require('bcryptjs');

    const user = await User.findOne({ email });
    
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department };
        const jwt = require('jsonwebtoken');
        if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
        const token = jwt.sign(safeUser, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ success: true, user: safeUser, token });
      } else {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Google OAuth Login
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    const { OAuth2Client } = require('google-auth-library');
    if (!process.env.GOOGLE_CLIENT_ID) throw new Error('GOOGLE_CLIENT_ID is required');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;

    const user = await User.findOne({ email });
    if (user) {
      const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department };
      const jwt = require('jsonwebtoken');
      if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
      const serverToken = jwt.sign(safeUser, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.json({ success: true, user: safeUser, token: serverToken });
    } else {
      res.status(401).json({ success: false, message: `Access Denied: ${email} is not registered in the system.` });
    }
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ success: false, message: 'Google Authentication Failed' });
  }
});

// Get all users
const authMiddleware = require('../middleware/authMiddleware');
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    // Map _id to id
    res.json(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, department: u.department })));
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Change Password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const bcrypt = require('bcryptjs');

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
