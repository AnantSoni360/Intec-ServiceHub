const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Asset = require('../models/Asset');

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
    await Company.findByIdAndDelete(id);

    res.json({ success: true, message: 'Company and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete company' });
  }
});

module.exports = router;
