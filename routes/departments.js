const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Department = require('../models/Department');
const ActivityLog = require('../models/ActivityLog');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// Validation Middleware
const departmentValidation = [
  body('name').notEmpty().withMessage('Department name is required').trim().escape(),
  body('description').optional().trim().escape(),
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

// Get all departments
router.get('/', async (req, res, next) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    next(err);
  }
});

// Create a new department
router.post('/', authenticate, authorize('admin'), departmentValidation, checkValidation, async (req, res, next) => {
  const department = new Department({
    name: req.body.name,
    description: req.body.description,
  });
  try {
    const newDepartment = await department.save();
    
    // Log activity
    await ActivityLog.create({
      action: 'Department Added',
      description: `New department "${newDepartment.name}" created`,
      user: req.user.name || 'Admin User'
    });

    res.status(201).json(newDepartment);
  } catch (err) {
    next(err);
  }
});

// Edit a department (admin only)
router.put('/:id', authenticate, authorize('admin'), departmentValidation, checkValidation, async (req, res, next) => {
  const { name, description } = req.body;

  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!department) {
      const error = new Error('Department not found');
      error.statusCode = 404;
      return next(error);
    }

    // Log activity
    await ActivityLog.create({
      action: 'Department Updated',
      description: `Department "${department.name}" updated`,
      user: req.user.name || 'Admin User'
    });

    res.json(department);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
