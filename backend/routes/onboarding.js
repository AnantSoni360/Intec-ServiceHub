const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Company = require('../models/Company');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Asset = require('../models/Asset');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/uploadMiddleware');
const csv = require('csv-parser');
const fs = require('fs');

// Helper to parse CSV
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

// Register and Upload Data
router.post('/register-and-upload', upload.fields([{ name: 'users' }, { name: 'assets' }, { name: 'tickets' }]), async (req, res) => {
  let createdCompanyId = null;
  
  try {
    const { companyName, userName, email, password } = req.body;

    // 1. Validate mandatory files
    if (!req.files || !req.files['users'] || !req.files['assets'] || !req.files['tickets']) {
      return res.status(400).json({ success: false, message: 'All three CSV files (users, assets, tickets) are mandatory.' });
    }

    // 2. Check if user or company already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const existingCompany = await Company.findOne({ name: companyName });
    if (existingCompany) {
      return res.status(400).json({ success: false, message: 'Company name is already taken' });
    }

    // 3. Create Company and User
    const companyId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    createdCompanyId = companyId;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      _id: userId,
      name: userName,
      email,
      password: hashedPassword,
      role: 'super_admin',
      department: 'Administration',
      companyId: companyId
    });

    const company = new Company({
      _id: companyId,
      name: companyName,
      superAdminId: userId
    });

    await company.save();
    await newUser.save();

    // 4. Process Uploaded Data
    let usersCount = 0, assetsCount = 0, ticketsCount = 0;

    // Process Users
    const userMapByEmail = {};
    // Add super admin to map
    userMapByEmail[email] = newUser._id;
    
    const rawUsers = await parseCSV(req.files['users'][0].path);
    for (const u of rawUsers) {
      const existing = await User.findOne({ email: u.Email });
      if (!existing && u.Email !== email) {
        const tempPassword = await bcrypt.hash('password123', 10);
        const csvUser = new User({
          name: u.Name,
          email: u.Email,
          password: tempPassword,
          role: u.Role === 'IT Engineer' ? 'Engineer' : (u.Role === 'IT Manager' ? 'Admin' : u.Role),
          department: u.Department,
          companyId
        });
        await csvUser.save();
        userMapByEmail[u.Email] = csvUser._id;
        usersCount++;
      } else if (existing) {
        userMapByEmail[u.Email] = existing._id;
      }
    }

    // Process Assets
    const assetMapBySerialNumber = {};
    const rawAssets = await parseCSV(req.files['assets'][0].path);
    for (const a of rawAssets) {
      const assignedTo = userMapByEmail[a.Assigned_To_Email] || null;
      const newAsset = new Asset({
        name: a.Asset_Name,
        type: a.Asset_Type,
        serialNumber: a.Serial_Number,
        status: a.Status,
        assignedTo,
        companyId
      });
      await newAsset.save();
      assetMapBySerialNumber[a.Serial_Number] = newAsset._id;
      assetsCount++;
    }

    // Process Tickets
    const rawTickets = await parseCSV(req.files['tickets'][0].path);
    for (const t of rawTickets) {
      const requestedBy = userMapByEmail[t.Requested_By_Email];
      const assignedTo = userMapByEmail[t.Assigned_To_Email] || null;
      
      if (requestedBy) {
        const newTicket = new Ticket({
          title: t.Title,
          description: t.Description,
          priority: t.Priority === 'Critical' ? 'High' : t.Priority,
          status: (t.Status === 'Closed' || t.Status === 'Cancelled') ? 'Resolved' : t.Status,
          requestedBy,
          assignedTo,
          companyId
        });
        await newTicket.save();
        ticketsCount++;
      }
    }

    // 5. Generate token for auto-login
    const safeUser = { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, department: newUser.department, companyId: newUser.companyId, companyName: company.name };
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
    const token = jwt.sign(safeUser, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ 
      success: true, 
      user: safeUser, 
      token, 
      message: `Workspace created successfully. Added ${usersCount} users, ${assetsCount} assets, and ${ticketsCount} tickets.` 
    });

  } catch (error) {
    console.error('Registration/Upload Error:', error);
    
    // Rollback: if company was created but something failed
    if (createdCompanyId) {
      try {
        await Asset.deleteMany({ companyId: createdCompanyId });
        await Ticket.deleteMany({ companyId: createdCompanyId });
        await User.deleteMany({ companyId: createdCompanyId });
        await Company.findByIdAndDelete(createdCompanyId);
        console.log('Rollback successful for company:', createdCompanyId);
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
    }

    res.status(500).json({ success: false, message: error.message || 'Server error during workspace setup' });
  } finally {
    // Cleanup uploaded files
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        req.files[key].forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      });
    }
  }
});

module.exports = router;
