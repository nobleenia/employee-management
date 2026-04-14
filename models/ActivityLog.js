const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    action: { type: String, required: true },
    description: { type: String },
    user: { type: String, default: 'System' },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activitySchema);
