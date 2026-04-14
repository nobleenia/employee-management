const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Organization = require('../models/Organization');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

// Verify invitation link
router.get('/invite/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ msg: 'Invalid invitation link' });
    if (employee.userId) return res.status(400).json({ msg: 'Invitation already used' });
    res.json({ email: employee.email, name: `${employee.name} ${employee.surname}`.trim() });
  } catch (err) {
    console.error('Server Error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Register a new user
router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, inviteId } = req.body;
    let { name } = req.body;

    // Use email as name if not provided
    if (!name) {
      name = email.split('@')[0];
    }

    try {
      if (inviteId) {
        const employee = await Employee.findById(inviteId);
        if (!employee) return res.status(400).json({ msg: 'Invalid invitation link' });
        if (employee.userId) return res.status(400).json({ msg: 'Invitation already used' });

        const userEmail = employee.email || email;

        // Check if user already exists
        let user = await User.findOne({ email: userEmail });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({
          name: employee.name,
          email: userEmail,
          password,
          role: 'user', // Invited employees join as regular users
          organizationId: employee.organizationId
        });
        await user.save();

        employee.userId = user._id;
        await employee.save();

        const token = jwt.sign(
          { id: user.id, name: user.name, role: user.role, organizationId: employee.organizationId },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '1h' }
        );

        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600000 
        });

        return res.json({ msg: 'Registration successful', user: { name: user.name, role: user.role, organizationId: user.organizationId } });
      }

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // We need an ID for the organization owner, but we don't have the user ID yet until we save.
      // So we will first create the user without saving to get the ID
      user = new User({
        name,
        email,
        password,
        role: 'admin', // The first person to register a workspace becomes the admin
      });

      // Create an organization for this user
      const organization = new Organization({
        name: `${name}'s Workspace`,
        ownerId: user._id
      });
      await organization.save();

      // Assign organizationId to user and save
      user.organizationId = organization._id;
      await user.save();

      // Generate token
      const token = jwt.sign(
        { id: user.id, name: user.name, role: user.role, organizationId: organization._id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000 
      });

      res.json({ msg: 'Registration successful', user: { name: user.name, role: user.role, organizationId: user.organizationId } });
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role, organizationId: user.organizationId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    });

    res.json({ msg: 'Login successful', user: { name: user.name, role: user.role, organizationId: user.organizationId } });
  } catch (err) {
    console.error('Server Error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Logout a user
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ msg: 'Logged out successfully' });
});

module.exports = router;
