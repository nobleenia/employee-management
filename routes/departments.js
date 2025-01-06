const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new department
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const department = new Department({
    name: req.body.name,
  });
  try {
    const newDepartment = await department.save();
    res.status(201).json(newDepartment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Edit a department (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const { name } = req.body;

  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    res.json(department);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
