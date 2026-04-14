const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const ActivityLog = require('../models/ActivityLog');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const departments = await Department.find({ organizationId: req.user.organizationId }).lean();
    
    // Calculate employee count per department
    const departmentsWithCounts = await Promise.all(departments.map(async (dept) => {
      const count = await Employee.countDocuments({ department: dept._id, organizationId: req.user.organizationId });
      return { ...dept, employeeCount: count };
    }));
    
    res.json(departmentsWithCounts);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  const { name, description } = req.body;
  try {
    const department = new Department({ name, description, organizationId: req.user.organizationId });
    await department.save();

    await ActivityLog.create({
      action: 'Department Added',
      description: `New department: ${name}`,
      user: req.user?.name || 'Admin',
      organizationId: req.user.organizationId
    });

    res.status(201).json(department);
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  const { name, description } = req.body;
  try {
    const department = await Department.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { name, description },
      { new: true }
    );
    if (!department) return next(new Error('Department not found'));

    await ActivityLog.create({
      action: 'Department Updated',
      description: `${department.name} details changed`,
      user: req.user?.name || 'Admin User',
      organizationId: req.user.organizationId
    });

    res.json(department);
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    // Re-assign employees before deleting? Or block?
    // Simplified for now: just delete.
    const department = await Department.findOneAndDelete({ _id: req.params.id, organizationId: req.user.organizationId });
    if (!department) return next(new Error('Department not found'));

    await Employee.updateMany(
      { department: req.params.id, organizationId: req.user.organizationId },
      { department: null }
    );

    await ActivityLog.create({
      action: 'Department Deleted',
      description: `${department.name} was removed`,
      user: req.user?.name || 'Admin User',
      organizationId: req.user.organizationId
    });

    res.json({ msg: 'Department deleted. Employees reassigned.' });
  } catch (err) {
    next(err);
  }
});


router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const department = await Department.findOne({ _id: req.params.id, organizationId: req.user.organizationId });
    if (!department) return res.status(404).json({ msg: 'Department not found' });
    res.json(department);
  } catch (err) { next(err); }
});

module.exports = router;

