const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const ActivityLog = require('../models/ActivityLog');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// Validation Middleware
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

// Get all employees with search, filter, and pagination
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, department, name } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (name) filter.name = { $regex: name, $options: 'i' };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const employees = await Employee.find(filter)
      .populate('department', 'name')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Employee.countDocuments(filter);

    res.json({
      employees,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
});

// Create a new employee (admin only)
router.post('/', authenticate, authorize('admin'), employeeValidation, checkValidation, async (req, res, next) => {
  const { name, surname, department, email, phone, role, status } = req.body;

  try {
    const employee = new Employee({ name, surname, department, email, phone, role, status });
    await employee.save();

    // Fetch department for log detail
    let logDesc = `${name} ${surname} joined`;
    try {
      const deptDetails = await Department.findById(department);
      if (deptDetails) logDesc += ` ${deptDetails.name} team`;
    } catch(e) {}

    await ActivityLog.create({
      action: 'Employee Added',
      description: logDesc,
      user: req.user?.name || 'Admin User'
    });

    res.status(201).json(employee);
  } catch (err) {
    next(err);
  }
});

// Update an employee (admin only)
router.put('/:id', authenticate, authorize('admin'), employeeValidation, checkValidation, async (req, res, next) => {
  const { name, surname, department, email, phone, role, status } = req.body;

  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, surname, department, email, phone, role, status },
      { new: true }
    );
    if (!employee) {
      const error = new Error('Employee not found');
      error.statusCode = 404;
      return next(error);
    }

    await ActivityLog.create({
      action: 'Employee Updated',
      description: `${employee.name} ${employee.surname} updated`,
      user: req.user?.name || 'Admin User'
    });

    res.json(employee);
  } catch (err) {
    next(err);
  }
});

// Delete an employee (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      const error = new Error('Employee not found');
      error.statusCode = 404;
      return next(error);
    }

    await ActivityLog.create({
      action: 'Employee Deleted',
      description: `${employee.name} ${employee.surname} deleted`,
      user: req.user?.name || 'Admin User'
    });

    res.json({ msg: 'Employee deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
