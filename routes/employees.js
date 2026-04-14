const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const ActivityLog = require('../models/ActivityLog');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

const employeeValidation = [
  body('name').notEmpty().withMessage('Name is required').trim().escape(),
  body('surname').notEmpty().withMessage('Surname is required').trim().escape(),
  body('department').isMongoId().withMessage('Valid department ID is required'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().trim().escape(),
  body('role').optional().trim().escape(),
  body('status').optional().isIn(['active', 'inactive', 'on-leave']).withMessage('Invalid status'),
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.message = errors.array().map((e) => e.msg).join(', ');
    return next(error);
  }
  next();
};

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, department, name } = req.query;
    const filter = { organizationId: req.user.organizationId };
    
    if (department) filter.department = department;
    if (name) filter.name = { $regex: name, $options: 'i' };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const employees = await Employee.find(filter)
      .populate('department', 'name')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Employee.countDocuments(filter);

    res.json({ employees, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) { next(err); }
});


// Claim an employee record
router.post('/claim', authenticate, async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    // For simplicity, we find an employee by email that isn't claimed
    const employee = await Employee.findOneAndUpdate(
      { email: req.body.email, organizationId: req.user.organizationId, userId: { $exists: false } },
      { userId: req.user.id },
      { new: true }
    );
    if (!employee) return res.status(404).json({ msg: 'Employee record not found or already claimed' });
    res.json({ msg: 'Successfully claimed employee profile', employee });
  } catch (err) { next(err); }
});

// Get self profile
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id, organizationId: req.user.organizationId })
      .populate('department', 'name');
    if (!employee) return res.status(404).json({ msg: 'No employee profile linked to this user' });
    res.json(employee);
  } catch (err) { next(err); }
});

// Update self profile
router.put('/me', authenticate, async (req, res, next) => {
  try {
    const { phone, address, emergencyContact } = req.body;
    const employee = await Employee.findOneAndUpdate(
      { userId: req.user.id, organizationId: req.user.organizationId },
      { phone, address, emergencyContact },
      { new: true }
    ).populate('department', 'name');
    if (!employee) return res.status(404).json({ msg: 'No employee profile linked to this user' });
    res.json(employee);
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('admin'), employeeValidation, checkValidation, async (req, res, next) => {
  const { name, surname, department, email, phone, role, status, managerId } = req.body;
  try {
    const employee = new Employee({ 
      name, surname, department, email, phone, role, status, managerId,
      organizationId: req.user.organizationId 
    });
    await employee.save();

    let logDesc = `${name} ${surname} joined`;
    try {
      const deptDetails = await Department.findById(department);
      if (deptDetails) logDesc += ` ${deptDetails.name} team`;
    } catch(e) {}

    await ActivityLog.create({
      action: 'Employee Added',
      description: logDesc,
      user: req.user?.name || 'Admin User',
      organizationId: req.user.organizationId
    });

    res.status(201).json(employee);
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, authorize('admin'), employeeValidation, checkValidation, async (req, res, next) => {
  const { name, surname, department, email, phone, role, status, managerId } = req.body;
  try {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { name, surname, department, email, phone, role, status, managerId },
      { new: true }
    );
    if (!employee) return next(new Error('Employee not found'));

    await ActivityLog.create({
      action: 'Employee Updated',
      description: `${employee.name} ${employee.surname} updated`,
      user: req.user?.name || 'Admin User',
      organizationId: req.user.organizationId
    });

    res.json(employee);
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const employee = await Employee.findOneAndDelete({ _id: req.params.id, organizationId: req.user.organizationId });
    if (!employee) return next(new Error('Employee not found'));

    await ActivityLog.create({
      action: 'Employee Deleted',
      description: `${employee.name} ${employee.surname} deleted`,
      user: req.user?.name || 'Admin User',
      organizationId: req.user.organizationId
    });

    res.json({ msg: 'Employee deleted successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
