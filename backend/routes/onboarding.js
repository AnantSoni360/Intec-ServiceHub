const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Asset = require('../models/Asset');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/uploadMiddleware');
const csv = require('csv-parser');
const fs = require('fs');

// Register a new company and super admin
router.post('/register', async (req, res) => {
  try {
    const { companyName, userName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({ name: companyName });
    if (existingCompany) {
      return res.status(400).json({ success: false, message: 'Company name is already taken' });
    }

    // Create Company first (without superAdminId)
    const newCompany = new Company({
      name: companyName,
      superAdminId: null, // Will update shortly
    });
    // We can't save it yet because superAdminId is required.
    // Wait, let's remove required: true temporarily or use a transaction.
    // Since mongoose Schema has required: true, we must provide it.
    // Let's create user first with a dummy companyId? No, User requires companyId.
    // We have a circular dependency in creation if both are required.
    // Let's update the Company schema to not require superAdminId during initial creation, or just disable validation temporarily.
    // Actually, in mongoose, if we generate ObjectId first we can use it.
    const mongoose = require('mongoose');
    const companyId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    // Hash password
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

    // Generate token
    const safeUser = { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, department: newUser.department, companyId: newUser.companyId, companyName: company.name };
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
    const token = jwt.sign(safeUser, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ success: true, user: safeUser, token });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

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

// Upload Data for a company
const authMiddleware = require('../middleware/authMiddleware');
router.post('/upload-data', authMiddleware, upload.fields([{ name: 'users' }, { name: 'assets' }, { name: 'tickets' }]), async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (req.user.role !== 'super_admin') {
       return res.status(403).json({ success: false, message: 'Only super admin can upload initial data' });
    }

    let usersCount = 0, assetsCount = 0, ticketsCount = 0;

    // Process Users
    const userMapByEmail = {};
    if (req.files['users']) {
      const rawUsers = await parseCSV(req.files['users'][0].path);
      for (const u of rawUsers) {
        // skip if email exists in this company or globally depending on uniqueness
        const existing = await User.findOne({ email: u.Email });
        if (!existing) {
          const tempPassword = await bcrypt.hash('password123', 10); // default password
          const newUser = new User({
            name: u.Name,
            email: u.Email,
            password: tempPassword,
            role: u.Role === 'IT Engineer' ? 'Engineer' : (u.Role === 'IT Manager' ? 'Admin' : u.Role),
            department: u.Department,
            companyId
          });
          await newUser.save();
          userMapByEmail[u.Email] = newUser._id;
          usersCount++;
        } else {
           userMapByEmail[u.Email] = existing._id;
        }
      }
    }

    // Process Assets
    const assetMapBySerialNumber = {};
    if (req.files['assets']) {
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
    }

    // Process Tickets
    if (req.files['tickets']) {
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
    }

    res.json({ success: true, message: `Data uploaded successfully. Added ${usersCount} users, ${assetsCount} assets, and ${ticketsCount} tickets.` });
  } catch (error) {
    console.error('Upload Data Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during data upload' });
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
