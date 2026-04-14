const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }
});

module.exports = mongoose.model('Department', departmentSchema);
