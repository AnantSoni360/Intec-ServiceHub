const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  url: String,
  filename: String
});

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'Other', enum: ['Hardware', 'Software', 'Network', 'Access Request', 'Other'] },
  priority: { type: String, required: true, enum: ['Low', 'Medium', 'High'] },
  status: { type: String, default: 'Open', enum: ['Open', 'In Progress', 'Resolved'] },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', default: null },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  dueDate: { type: Date, default: null },
  slaBreached: { type: Boolean, default: false },
  attachments: [attachmentSchema],
  comments: [{
    text: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attachments: [attachmentSchema],
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

ticketSchema.index({ companyId: 1 });

ticketSchema.index({ requestedBy: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Ticket', ticketSchema);
