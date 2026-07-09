const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Company = require('../models/Company');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog'); // We will create this later
const platformAdminMiddleware = require('../middleware/platformAdminMiddleware');

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.PLATFORM_ADMIN_EMAIL || 'anantsoni@gmail.com';
  const adminPassword = process.env.PLATFORM_ADMIN_PASSWORD || 'new_secure_password_here';

  if (email === adminEmail && password === adminPassword) {
    if (!process.env.JWT_SECRET) return res.status(500).json({ success: false, message: 'Server missing JWT_SECRET' });
    const token = jwt.sign({ email, role: 'platform_admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid platform admin credentials' });
  }
});

router.get('/companies', platformAdminMiddleware, async (req, res) => {
  try {
    const companies = await Company.find();
    res.json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch companies' });
  }
});

router.delete('/companies/:id', platformAdminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    
    await Asset.deleteMany({ companyId: id });
    await Ticket.deleteMany({ companyId: id });
    await User.deleteMany({ companyId: id });
    await Company.findByIdAndDelete(id);

    // Audit Log for deletion (Item 6)
    if (AuditLog && AuditLog.create) {
      await AuditLog.create({
        actor: req.user.email,
        action: 'DELETE_COMPANY',
        target: company.name
      });
    }

    res.json({ success: true, message: 'Company and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete company' });
  }
});

module.exports = router;
