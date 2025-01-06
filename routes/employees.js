const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// Get all employees (accessible to both admin and users)
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().populate('department', 'name');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new employee (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const { name, surname, department } = req.body;

  try {
    const employee = new Employee({ name, surname, department });
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Update an employee (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const { name, surname, department } = req.body;

  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, surname, department },
      { new: true }
    );
    res.json(employee);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Delete an employee (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Search and filter employees
router.get('/', async (req, res) => {
  const { department, name } = req.query;

  try {
    const filter = {};
    if (department) filter.department = department;
    if (name) filter.name = { $regex: name, $options: 'i' };

    const employees = await Employee.find(filter);
    res.json(employees);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Pagination
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, department, name } = req.query;

  try {
    const filter = {};
    if (department) filter.department = department;
    if (name) filter.name = { $regex: name, $options: 'i' };

    const employees = await Employee.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Employee.countDocuments(filter);

    res.json({
      employees,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
