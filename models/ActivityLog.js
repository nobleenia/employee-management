const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'Employee Added', 'Department Updated'
  description: { type: String, required: true }, // e.g., 'Sarah Johnson promoted to Senior Software Engineer'
  user: { type: String, required: true }, // The name of the user who performed the action (e.g., 'Admin User')
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
