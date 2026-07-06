const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const Asset = require('../models/Asset');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authMiddleware);

const mapAsset = (a) => ({
  id: a._id,
  name: a.name,
  type: a.type,
  serialNumber: a.serialNumber,
  status: a.status,
  assignedTo: a.assignedTo,
  history: a.history || []
});

// Get all assets (Admin/Engineer)
router.get('/', requireRole('Admin', 'super_admin', 'Engineer'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = { companyId: req.user.companyId };
    if (req.query.status && req.query.status !== 'All') query.status = req.query.status;
    if (req.query.type && req.query.type !== 'All') query.type = req.query.type;
    if (req.query.search) {
      const safeSearch = escapeRegex(req.query.search);
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { serialNumber: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (req.query.sortBy === 'Oldest First') sortOption = { createdAt: 1 };
    
    const totalCount = await Asset.countDocuments(query);

    let assetsQuery = Asset.find(query).sort(sortOption);
    if (!req.query.export) {
      assetsQuery = assetsQuery.skip(skip).limit(limit);
    }
    const assets = await assetsQuery.exec();
    
    res.json({ data: assets.map(mapAsset), totalCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assets for specific user
router.get('/user/:userId', async (req, res) => {
  try {
    // Ownership check
    if (req.user.id !== req.params.userId && !['Admin', 'super_admin', 'Engineer'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access Denied: Cannot view other users\' assets' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = { assignedTo: req.params.userId, companyId: req.user.companyId };
    if (req.query.status && req.query.status !== 'All') query.status = req.query.status;
    if (req.query.type && req.query.type !== 'All') query.type = req.query.type;
    if (req.query.search) {
      const safeSearch = escapeRegex(req.query.search);
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { serialNumber: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (req.query.sortBy === 'Oldest First') sortOption = { createdAt: 1 };
    
    const totalCount = await Asset.countDocuments(query);

    let assetsQuery = Asset.find(query).sort(sortOption);
    if (!req.query.export) {
      assetsQuery = assetsQuery.skip(skip).limit(limit);
    }
    const assets = await assetsQuery.exec();
    
    res.json({ data: assets.map(mapAsset), totalCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new asset
router.post('/', requireRole('Admin', 'super_admin', 'Engineer'), async (req, res) => {
  try {
    const asset = new Asset({
      name: req.body.name,
      type: req.body.type,
      serialNumber: req.body.serialNumber,
      status: 'Available',
      assignedTo: null,
      companyId: req.user.companyId,
      history: [{ action: 'Created', userId: req.user.id }]
    });
    const savedAsset = await asset.save();
    res.status(201).json(mapAsset(savedAsset));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update assets
router.post('/bulk/update', requireRole('Admin', 'super_admin', 'Engineer'), async (req, res) => {
  try {
    const { assetIds, updateData } = req.body;
    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return res.status(400).json({ message: 'No asset IDs provided' });
    }
    
    const allowedUpdates = {};
    const historyEntry = { userId: req.user.id, date: new Date() };

    if (updateData.status) {
      allowedUpdates.status = updateData.status;
      if (updateData.status === 'Available') historyEntry.action = 'Marked as Available';
      else if (updateData.status === 'Maintenance') historyEntry.action = 'Sent to Maintenance';
      else historyEntry.action = `Status changed to ${updateData.status}`;
    }
    
    if (updateData.assignedTo !== undefined) {
      allowedUpdates.assignedTo = updateData.assignedTo;
      if (updateData.assignedTo === null) historyEntry.action = 'Unassigned';
      else historyEntry.action = 'Assigned';
    }
    
    const mongoose = require('mongoose');
    const objectIds = assetIds.map(id => new mongoose.Types.ObjectId(id));

    await Asset.updateMany(
      { _id: mongoose.trusted({ $in: objectIds }), companyId: req.user.companyId },
      { 
        $set: allowedUpdates,
        $push: { history: historyEntry }
      }
    );
    
    res.json({ message: `${assetIds.length} assets updated successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk delete assets
router.post('/bulk/delete', requireRole('Admin', 'super_admin'), async (req, res) => {
  try {
    const { assetIds } = req.body;
    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return res.status(400).json({ message: 'No asset IDs provided' });
    }

    const mongoose = require('mongoose');
    const objectIds = assetIds.map(id => new mongoose.Types.ObjectId(id));

    await Asset.deleteMany({ _id: mongoose.trusted({ $in: objectIds }), companyId: req.user.companyId });
    res.json({ message: `${assetIds.length} assets deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update asset assignment/status
router.put('/:id', requireRole('Admin', 'super_admin', 'Engineer'), async (req, res) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    let action = 'Updated';
    if (req.body.status && req.body.status !== asset.status) {
      asset.status = req.body.status;
      if (req.body.status === 'Maintenance') action = 'Sent to Maintenance';
      else if (req.body.status === 'Available') action = 'Marked as Available';
      else action = `Status changed to ${req.body.status}`;
    }
    
    if (req.body.assignedTo !== undefined && String(req.body.assignedTo) !== String(asset.assignedTo)) {
      asset.assignedTo = req.body.assignedTo;
      action = req.body.assignedTo ? 'Assigned' : 'Unassigned';
    }

    asset.history.push({ action, userId: req.user.id });
    const updated = await asset.save();
    res.json(mapAsset(updated));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
