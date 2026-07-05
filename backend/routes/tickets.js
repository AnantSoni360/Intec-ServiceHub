const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { sendEmail } = require('../utils/email');

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
  assetId: t.assetId,
  dueDate: t.dueDate,
  slaBreached: t.slaBreached,
  attachments: t.attachments ? t.attachments.map(att => ({
    filename: att.filename,
    url: att.url && att.url.startsWith('/uploads/') ? `/api/tickets/${t._id}/attachments/${att.url.replace('/uploads/', '')}` : att.url
  })) : [],
  comments: t.comments ? t.comments.map(c => ({
    text: c.text,
    authorId: c.authorId,
    createdAt: c.createdAt,
    attachments: c.attachments ? c.attachments.map(att => ({
      filename: att.filename,
      url: att.url && att.url.startsWith('/uploads/') ? `/api/tickets/${t._id}/attachments/${att.url.replace('/uploads/', '')}` : att.url
    })) : []
  })) : [],
  createdAt: t.createdAt
});

const calculateDueDate = (priority) => {
  const now = new Date();
  if (priority === 'High') return new Date(now.getTime() + 4 * 60 * 60 * 1000);
  if (priority === 'Medium') return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return new Date(now.getTime() + 72 * 60 * 60 * 1000);
};

const checkSLA = (ticket) => {
  if (ticket.status !== 'Resolved' && ticket.dueDate && new Date() > ticket.dueDate && !ticket.slaBreached) {
    ticket.slaBreached = true;
    return true;
  }
  return false;
};

// Dashboard Stats (Admin/Engineer)
router.get('/stats', requireRole('Admin', 'Engineer'), async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyVolume = await Ticket.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          tickets: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const chartData = dailyVolume.map(d => ({
      name: new Date(d._id).toLocaleDateString('en-US', { weekday: 'short' }),
      tickets: d.tickets
    }));

    res.json({ chartData });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// Get all tickets
router.get('/', requireRole('Admin', 'Engineer'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status && req.query.status !== 'All') query.status = req.query.status;
    if (req.query.priority && req.query.priority !== 'All') query.priority = req.query.priority;
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (req.query.sortBy === 'Oldest First') sortOption = { createdAt: 1 };
    if (req.query.sortBy === 'Priority (High to Low)') sortOption = { priority: -1 }; // Note: text sort may not be perfect for enum but works if standard

    const totalCount = await Ticket.countDocuments(query);
    
    let ticketsQuery = Ticket.find(query).populate('assetId').sort(sortOption);
    if (!req.query.export) {
      ticketsQuery = ticketsQuery.skip(skip).limit(limit);
    }
    
    const tickets = await ticketsQuery.exec();
    
    for (let t of tickets) {
      if (checkSLA(t)) await t.save();
    }

    res.json({ data: tickets.map(mapTicket), totalCount });
  } catch (error) {
    console.error('Fetch Tickets Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user tickets
router.get('/user/:userId', async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && !['Admin', 'Engineer'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access Denied' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = { requestedBy: req.params.userId };
    if (req.query.status && req.query.status !== 'All') query.status = req.query.status;
    if (req.query.priority && req.query.priority !== 'All') query.priority = req.query.priority;
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (req.query.sortBy === 'Oldest First') sortOption = { createdAt: 1 };
    if (req.query.sortBy === 'Priority (High to Low)') sortOption = { priority: -1 };

    const totalCount = await Ticket.countDocuments(query);

    let ticketsQuery = Ticket.find(query).populate('assetId').sort(sortOption);
    if (!req.query.export) {
      ticketsQuery = ticketsQuery.skip(skip).limit(limit);
    }
    const tickets = await ticketsQuery.exec();
    
    for (let t of tickets) {
      if (checkSLA(t)) await t.save();
    }

    res.json({ data: tickets.map(mapTicket), totalCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create ticket
router.post('/', upload.array('attachments', 3), async (req, res) => {
  try {
    const attachments = req.files ? req.files.map(f => ({ url: `/uploads/${f.filename}`, filename: f.originalname })) : [];
    
    const ticket = new Ticket({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category || 'Other',
      priority: req.body.priority || 'Medium',
      status: 'Open',
      requestedBy: req.user.id,
      assetId: req.body.assetId || null,
      dueDate: calculateDueDate(req.body.priority || 'Medium'),
      attachments
    });
    
    const savedTicket = await ticket.save();

    const adminUser = await User.findOne({ role: 'Admin' });
    if (adminUser) {
      sendEmail(
        adminUser.email, 
        `New Ticket Raised: ${savedTicket.title}`, 
        `<p>A new ticket was raised.</p><p><strong>Title:</strong> ${savedTicket.title}</p><p><strong>Priority:</strong> ${savedTicket.priority}</p>`
      );
    }

    res.status(201).json(mapTicket(savedTicket));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update tickets
router.post('/bulk/update', requireRole('Admin', 'Engineer'), async (req, res) => {
  try {
    const { ticketIds, updateData } = req.body;
    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({ message: 'No ticket IDs provided' });
    }
    
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
router.post('/bulk/delete', requireRole('Admin'), async (req, res) => {
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

// Update single ticket
router.put('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const updateData = {};
    const isRequester = String(ticket.requestedBy) === req.user.id;
    const isPrivileged = ['Admin', 'Engineer'].includes(req.user.role);

    if (req.body.status) {
      if (isRequester || isPrivileged) {
        updateData.status = req.body.status;
        
        if (req.body.status === 'Resolved' && ticket.status !== 'Resolved') {
           const requester = await User.findById(ticket.requestedBy);
           if (requester) {
             sendEmail(requester.email, `Ticket Resolved: ${ticket.title}`, `<p>Your ticket has been resolved.</p>`);
           }
        }
      } else {
        return res.status(403).json({ message: 'Not authorized to change status' });
      }
    }

    if (req.body.assignedTo !== undefined) {
      if (isPrivileged) {
        updateData.assignedTo = req.body.assignedTo;
        
        if (req.body.assignedTo && String(req.body.assignedTo) !== String(ticket.assignedTo)) {
           const assignee = await User.findById(req.body.assignedTo);
           if (assignee) {
             sendEmail(assignee.email, `Ticket Assigned: ${ticket.title}`, `<p>You have been assigned to a new ticket.</p>`);
           }
        }
      } else {
        return res.status(403).json({ message: 'Not authorized to change assignment' });
      }
    }

    const updated = await Ticket.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('assetId');
    res.json(mapTicket(updated));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comments', upload.array('attachments', 3), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const isRequester = String(ticket.requestedBy) === req.user.id;
    const isAssignee = String(ticket.assignedTo) === req.user.id;
    const isPrivileged = ['Admin', 'Engineer'].includes(req.user.role);

    if (!isRequester && !isAssignee && !isPrivileged) {
      return res.status(403).json({ message: 'Not authorized to comment' });
    }

    const attachments = req.files ? req.files.map(f => ({ url: `/uploads/${f.filename}`, filename: f.originalname })) : [];

    ticket.comments.push({ text, authorId: req.user.id, attachments });
    await ticket.save();
    
    if (isRequester && ticket.assignedTo) {
      const assignee = await User.findById(ticket.assignedTo);
      if (assignee) sendEmail(assignee.email, `New Comment on Ticket: ${ticket.title}`, `<p>The requester added a comment.</p>`);
    } else if (isAssignee) {
      const requester = await User.findById(ticket.requestedBy);
      if (requester) sendEmail(requester.email, `New Comment on Ticket: ${ticket.title}`, `<p>The engineer added a comment.</p>`);
    }

    res.json(mapTicket(ticket));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const path = require('path');
const fs = require('fs');

// Secure Attachment Download
router.get('/:id/attachments/:filename', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const isRequester = String(ticket.requestedBy) === req.user.id;
    const isAssignee = String(ticket.assignedTo) === req.user.id;
    const isPrivileged = ['Admin', 'Engineer'].includes(req.user.role);

    if (!isRequester && !isAssignee && !isPrivileged) {
      return res.status(403).json({ message: 'Access denied to this attachment' });
    }

    const safeFilename = path.basename(req.params.filename);
    const filePath = path.join(__dirname, '..', 'uploads', safeFilename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
