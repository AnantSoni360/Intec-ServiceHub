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
const crypto = require('crypto');

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
    const importedCredentials = []; // returned once to the super admin so they can be shared out securely
    for (const u of rawUsers) {
      // Handle potential BOM or casing issues in headers
      const rowEmail = (u.Email || u.email || u[' Email'] || '').trim();
      const rowName = (u.Name || u.name || '').trim();
      const rowRole = (u.Role || u.role || '').trim();
      const rowDept = (u.Department || u.department || '').trim();

      if (!rowEmail || !rowName) continue; // Skip invalid rows

      const existing = await User.findOne({ email: rowEmail });
      if (!existing && rowEmail !== email) {
        // Unique random password per user — never a shared/guessable default.
        const rawTempPassword = crypto.randomBytes(6).toString('hex'); // 12 chars
        const hashedTempPassword = await bcrypt.hash(rawTempPassword, 10);
        const csvUser = new User({
          name: rowName,
          email: rowEmail,
          password: hashedTempPassword,
          role: rowRole === 'IT Engineer' ? 'Engineer' : (rowRole === 'IT Manager' ? 'Admin' : rowRole),
          department: rowDept,
          companyId,
          mustChangePassword: true
        });
        await csvUser.save();
        userMapByEmail[rowEmail] = csvUser._id;
        importedCredentials.push({ email: rowEmail, tempPassword: rawTempPassword });
        usersCount++;
      } else if (existing) {
        userMapByEmail[rowEmail] = existing._id;
      }
    }

    // Process Assets
    const assetMapBySerialNumber = {};
    const rawAssets = await parseCSV(req.files['assets'][0].path);
    for (const a of rawAssets) {
      const assignedEmail = (a.Assigned_To_Email || a.assigned_to_email || a['Assigned To Email'] || '').trim();
      const assetName = (a.Asset_Name || a.asset_name || a['Asset Name'] || '').trim();
      const assetType = (a.Asset_Type || a.asset_type || a['Asset Type'] || 'Other').trim();
      const serial = (a.Serial_Number || a.serial_number || a['Serial Number'] || '').trim();
      const status = (a.Status || a.status || 'Available').trim();

      if (!assetName || !serial) continue;

      const assignedTo = userMapByEmail[assignedEmail] || null;
      const newAsset = new Asset({
        name: assetName,
        type: assetType,
        serialNumber: serial,
        status: status,
        assignedTo,
        companyId
      });
      await newAsset.save();
      assetMapBySerialNumber[serial] = newAsset._id;
      assetsCount++;
    }

    // Process Tickets
    const rawTickets = await parseCSV(req.files['tickets'][0].path);
    for (const t of rawTickets) {
      const reqEmail = (t.Requested_By_Email || t.requested_by_email || t['Requested By Email'] || '').trim();
      const assEmail = (t.Assigned_To_Email || t.assigned_to_email || t['Assigned To Email'] || '').trim();
      const title = (t.Title || t.title || '').trim();
      const desc = (t.Description || t.description || '').trim();
      const priority = (t.Priority || t.priority || 'Medium').trim();
      const status = (t.Status || t.status || 'Open').trim();

      if (!title || !reqEmail) continue;

      const requestedBy = userMapByEmail[reqEmail];
      const assignedTo = userMapByEmail[assEmail] || null;
      
      if (requestedBy) {
        const newTicket = new Ticket({
          title: title,
          description: desc,
          priority: priority === 'Critical' ? 'High' : priority,
          status: (status === 'Closed' || status === 'Cancelled') ? 'Resolved' : status,
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
      importedCredentials, // one-time list of {email, tempPassword} for the imported users — show once, don't log or persist in plaintext elsewhere
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
