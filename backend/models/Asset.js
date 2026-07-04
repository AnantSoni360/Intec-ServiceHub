const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Laptop', 'Desktop', 'Printer', 'Network', 'Monitor', 'Other'] },
  serialNumber: { type: String, required: true, unique: true },
  status: { type: String, default: 'Available', enum: ['Available', 'Assigned', 'Maintenance', 'Retired'] },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  history: [{
    action: { type: String, required: true },
    userId: { type: String, default: null },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: '' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
