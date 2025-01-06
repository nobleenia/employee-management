const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().populate('department', 'name');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new employee
router.post('/', async (req, res) => {
  const employee = new Employee({
    name: req.body.name,
    surname: req.body.surname,
    department: req.body.department,
  });
  try {
    const newEmployee = await employee.save();
    res.status(201).json(newEmployee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an employee
router.put('/:id', async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        surname: req.body.surname,
        department: req.body.department,
      },
      { new: true }
    );
    res.json(updatedEmployee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an employee
router.delete('/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
