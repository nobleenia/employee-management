const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');

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
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user = new User({
        name, // Add name
        email,
        password: hashedPassword,
      });

      await user.save();

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Generated Token:', token);
    res.json({ token });
  } catch (err) {
    console.error('Server Error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
