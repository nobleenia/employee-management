const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

// Register a new user
router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    check('name', 'Name is required').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // Create a new user instance
      user = new User({
        name,
        email,
        password, // Plaintext password - Will be hashed in the `User` model's pre-save middleware
      });

      // Save user to the database
      await user.save();

      // Generate token
      const token = jwt.sign(
        { id: user.id, name: user.name, role: user.role }, // Include name and role in the token
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      console.log('Generated Token:', token);
      res.json({ token });
    } catch (err) {
      console.error('Server Error:', err);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

// Login a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role }, // Include name and role in the token
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Generated Token:', token);
    res.json({ token });
  } catch (err) {
    console.error('Server Error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Make a user admin (admin-only)
router.put('/make-admin/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ msg: `${user.name} is now an admin.` });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
