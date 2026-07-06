const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Laptop', 'Desktop', 'Printer', 'Network', 'Monitor', 'Other'] },
  serialNumber: { type: String, required: true },
  status: { type: String, default: 'Available', enum: ['Available', 'Assigned', 'Maintenance', 'Retired'] },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  history: [{
    action: { type: String, required: true },
    userId: { type: String, default: null },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: '' }
  }]
}, { timestamps: true });

assetSchema.index({ companyId: 1, serialNumber: 1 }, { unique: true });

assetSchema.index({ assignedTo: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ type: 1 });
assetSchema.index({ name: 'text', serialNumber: 'text' });

module.exports = mongoose.model('Asset', assetSchema);
