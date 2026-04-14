const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const ActivityLog = require('../models/ActivityLog');

// Get dashboard KPIs and recent activity
router.get('/', async (req, res, next) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    
    // Count how many open roles we have - for this example, we'll mock it or base it on a query if needed later. 
    // The prototype shows "Open Roles: 5". Let's give a mocked metric for now.
    const openRoles = 5;

    // Fetch the 5 most recent activities
    const recentActivity = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      kpis: {
        totalEmployees,
        totalDepartments,
        activeEmployees,
        openRoles
      },
      recentActivity
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
