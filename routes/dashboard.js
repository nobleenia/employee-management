const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const ActivityLog = require('../models/ActivityLog');

router.get('/', authenticate, async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        
        // KPIs specific to the requested workspace
        const totalEmployees = await Employee.countDocuments({ organizationId });
        const totalDepartments = await Department.countDocuments({ organizationId });
        const activeEmployees = await Employee.countDocuments({ status: 'active', organizationId });
        const openRoles = 0; // Replace with an actual Job model down the line if needed

        // Activity Feed matching the requested workspace
        const recentActivity = await ActivityLog.find({ organizationId })
                                                .sort({ createdAt: -1 })
                                                .limit(10);
        
        res.json({
            kpis: {
                totalEmployees,
                totalDepartments,
                activeEmployees,
                openRoles
            },
            recentActivity
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error loading dashboard' });
    }
});

module.exports = router;
