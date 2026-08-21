const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/authMiddleware');
const { logAudit } = require('../middleware/auditLogger');

// POST /api/auth/signup - Employee Signup only
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Explicit constraint: Signup creates Employee accounts ONLY (no role selection at signup)
    const user = await User.create({
      name,
      email,
      password,
      role: 'Employee',
      department: department || null
    });

    await logAudit(user, 'USER_SIGNUP', 'User', user._id, `New employee signed up: ${user.email}`, req);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('department');

    if (user && (await user.matchPassword(password))) {
      if (user.status === 'Inactive') {
        return res.status(403).json({ message: 'Account is deactivated. Contact Admin.' });
      }

      await logAudit(user, 'USER_LOGIN', 'User', user._id, `User logged in: ${user.email}`, req);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('department');
  res.json(user);
});

module.exports = router;
