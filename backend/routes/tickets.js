const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

const mapTicket = (t) => ({
  id: t._id,
  title: t.title,
  description: t.description,
  category: t.category,
  priority: t.priority,
  status: t.status,
  requestedBy: t.requestedBy,
  assignedTo: t.assignedTo,
  comments: t.comments,
  createdAt: t.createdAt
});

// Get all tickets (Admin/Engineer)
router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find({}).sort({ createdAt: -1 });
    res.json(tickets.map(mapTicket));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tickets for specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const tickets = await Ticket.find({ requestedBy: req.params.userId }).sort({ createdAt: -1 });
    res.json(tickets.map(mapTicket));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new ticket
router.post('/', async (req, res) => {
  try {
    const ticket = new Ticket({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category || 'Other',
      priority: req.body.priority,
      status: 'Open',
      requestedBy: req.body.requestedBy
    });
    const savedTicket = await ticket.save();
    res.status(201).json(mapTicket(savedTicket));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update tickets
router.post('/bulk/update', async (req, res) => {
  try {
    const { ticketIds, updateData } = req.body;
    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({ message: 'No ticket IDs provided' });
    }
    
    // Only allow updating status, assignedTo, category, priority in bulk
    const allowedUpdates = {};
    if (updateData.status) allowedUpdates.status = updateData.status;
    if (updateData.assignedTo !== undefined) allowedUpdates.assignedTo = updateData.assignedTo;
    if (updateData.category) allowedUpdates.category = updateData.category;
    if (updateData.priority) allowedUpdates.priority = updateData.priority;

    await Ticket.updateMany(
      { _id: { $in: ticketIds } },
      { $set: allowedUpdates }
    );
    
    res.json({ message: `${ticketIds.length} tickets updated successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk delete tickets
router.post('/bulk/delete', async (req, res) => {
  try {
    const { ticketIds } = req.body;
    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({ message: 'No ticket IDs provided' });
    }

    await Ticket.deleteMany({ _id: { $in: ticketIds } });
    res.json({ message: `${ticketIds.length} tickets deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update single ticket (status/assignee)
router.put('/:id', async (req, res) => {
  try {
    const updateData = {};
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.assignedTo) updateData.assignedTo = req.body.assignedTo;

    const updated = await Ticket.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (updated) {
      res.json(mapTicket(updated));
    } else {
      res.status(404).json({ message: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to ticket
router.post('/:id/comments', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.comments.push({ text, authorId: req.user.id });
    await ticket.save();
    
    res.json(mapTicket(ticket));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
