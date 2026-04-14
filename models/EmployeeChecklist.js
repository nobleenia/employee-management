const mongoose = require('mongoose');

const employeeChecklistSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChecklistTemplate', required: true },
  tasks: [{
    task: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }
});

module.exports = mongoose.model('EmployeeChecklist', employeeChecklistSchema);
