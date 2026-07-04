const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const authMiddleware = require('../middleware/authMiddleware');

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
router.get('/', async (req, res) => {
  try {
    const assets = await Asset.find({}).sort({ createdAt: -1 });
    res.json(assets.map(mapAsset));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assets for specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const assets = await Asset.find({ assignedTo: req.params.userId }).sort({ createdAt: -1 });
    res.json(assets.map(mapAsset));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new asset
router.post('/', async (req, res) => {
  try {
    const asset = new Asset({
      name: req.body.name,
      type: req.body.type,
      serialNumber: req.body.serialNumber,
      status: 'Available',
      assignedTo: null,
      history: [{ action: 'Created', userId: req.user.id }]
    });
    const savedAsset = await asset.save();
    res.status(201).json(mapAsset(savedAsset));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update assets
router.post('/bulk/update', async (req, res) => {
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
    
    await Asset.updateMany(
      { _id: { $in: assetIds } },
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
router.post('/bulk/delete', async (req, res) => {
  try {
    const { assetIds } = req.body;
    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return res.status(400).json({ message: 'No asset IDs provided' });
    }

    await Asset.deleteMany({ _id: { $in: assetIds } });
    res.json({ message: `${assetIds.length} assets deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update asset assignment/status
router.put('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
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
