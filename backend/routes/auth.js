const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Company = require('../models/Company');

// Get all companies (public)
router.get('/companies', async (req, res) => {
  try {
    const companies = await Company.find({}, '_id name').sort({ name: 1 });
    res.json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received for:', req.body.email);
    const { email, password, companyId } = req.body;
    const bcrypt = require('bcryptjs');

    if (!companyId) return res.status(400).json({ success: false, message: 'Company selection is required' });

    const user = await User.findOne({ email, companyId }).populate('companyId');
    
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, companyId: user.companyId._id, companyName: user.companyId?.name };
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
    const { token, companyId } = req.body;
    const { OAuth2Client } = require('google-auth-library');
    if (!process.env.GOOGLE_CLIENT_ID) throw new Error('GOOGLE_CLIENT_ID is required');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;

    if (!companyId) return res.status(400).json({ success: false, message: 'Company selection is required' });
    const user = await User.findOne({ email, companyId }).populate('companyId');
    if (user) {
      const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, companyId: user.companyId._id, companyName: user.companyId?.name };
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
    const users = await User.find({ companyId: req.user.companyId });
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

// Add CRUD for users (Admin only)
const requireRole = require('../middleware/roleMiddleware');

// Create user
router.post('/users', authMiddleware, requireRole('Admin', 'super_admin'), async (req, res) => {
  try {
    const { name, email, role, department } = req.body;
    const bcrypt = require('bcryptjs');
    
    const existingUser = await User.findOne({ email, companyId: req.user.companyId });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const crypto = require('crypto');
    const tempPassword = crypto.randomBytes(6).toString('hex'); // 12 characters

    const password = await bcrypt.hash(tempPassword, 10);
    const user = new User({ name, email, password, role, department, companyId: req.user.companyId });
    await user.save();

    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, tempPassword });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/users/:id', authMiddleware, requireRole('Admin', 'super_admin'), async (req, res) => {
  try {
    const { name, email, role, department } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { name, email, role, department },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, department: user.department });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', authMiddleware, requireRole('Admin', 'super_admin'), async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password (Admin only)
router.post('/users/:id/reset-password', authMiddleware, requireRole('Admin', 'super_admin'), async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const user = await User.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const crypto = require('crypto');
    const tempPassword = crypto.randomBytes(6).toString('hex');
    user.password = await bcrypt.hash(tempPassword, 10);
    await user.save();
    res.json({ message: 'Password reset successfully', tempPassword });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
