const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  emergencyContact: { type: String },
  role: { type: String },
  status: { type: String, default: 'active', enum: ['active', 'inactive', 'on-leave'] },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
