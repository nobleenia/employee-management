const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  role: { type: String },
  status: { type: String, default: 'active', enum: ['active', 'inactive', 'on-leave'] },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
