const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Company = require('../models/Company');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog');
const platformAdminMiddleware = require('../middleware/platformAdminMiddleware');

// Strict limiter on the login route only — this guards the whole platform,
// so it gets a tighter budget than the general /api limiter in server.js.
const platformLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/admin/login
// Platform-owner login. Credentials live only in environment variables,
// never in source, and are unrelated to any tenant's user accounts.
router.post('/login', platformLoginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!process.env.PLATFORM_ADMIN_EMAIL || !process.env.PLATFORM_ADMIN_PASSWORD_HASH) {
      throw new Error('Platform admin credentials are not configured on the server.');
    }
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');

    // Constant-shape response whether the email or password is wrong,
    // so the endpoint doesn't reveal which one was incorrect.
    const emailMatches = email === process.env.PLATFORM_ADMIN_EMAIL;
    const passwordMatches = await bcrypt.compare(password || '', process.env.PLATFORM_ADMIN_PASSWORD_HASH);

    if (!emailMatches || !passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ scope: 'platform_owner', email }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ success: true, token });
  } catch (error) {
    console.error('Platform Admin Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Everything below requires a valid platform-owner token.
router.use(platformAdminMiddleware);

router.get('/companies', async (req, res) => {
  try {
    const companies = await Company.find();
    res.json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch companies' });
  }
});

router.delete('/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await Asset.deleteMany({ companyId: id });
    await Ticket.deleteMany({ companyId: id });
    await User.deleteMany({ companyId: id });
    const deleted = await Company.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    if (AuditLog && AuditLog.create) {
      await AuditLog.create({
        actor: req.platformAdmin.email,
        action: 'DELETE_COMPANY',
        target: deleted.name
      });
    }

    console.log(`[platform-admin] Company ${id} (${deleted.name}) deleted by ${req.platformAdmin.email}`);
    res.json({ success: true, message: 'Company and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete company' });
  }
});

module.exports = router;
