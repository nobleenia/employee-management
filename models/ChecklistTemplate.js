const mongoose = require('mongoose');

const checklistTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Onboarding', 'Offboarding'], required: true },
  tasks: [{ type: String, required: true }],
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }
});

module.exports = mongoose.model('ChecklistTemplate', checklistTemplateSchema);
