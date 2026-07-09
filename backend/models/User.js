const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Employee', 'Engineer', 'Admin', 'super_admin'] },
  department: { type: String, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  mustChangePassword: { type: Boolean, default: false },
  tokenVersion: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String }
}, { timestamps: true });

// Ensure email is unique per company
userSchema.index({ email: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
