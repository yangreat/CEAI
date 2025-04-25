const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock user data (In production, this would be a database)
const users = [];

/**
 * @route   POST api/users/register
 * @desc    Register a user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age, hasDisability } = req.body;

    // Check if user already exists
    const userExists = users.find(user => user.email === email);
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      age,
      hasDisability,
      preferences: {
        difficulty: 'medium',
        categories: ['memory', 'attention', 'executive', 'language', 'logic', 'emotion'],
        assistance: hasDisability ? true : false
      },
      progress: [],
      createdAt: new Date()
    };

    users.push(newUser);

    // Create JWT token
    const payload = {
      user: {
        id: newUser.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   POST api/users/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   GET api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', (req, res) => {
  try {
    // In a real app, you would verify the JWT token and get the user ID
    // For mock purposes, we'll assume user ID is passed in the query
    const userId = parseInt(req.query.userId);
    const user = users.find(user => user.id === userId);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Don't send password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   PUT api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    const { difficulty, categories, assistance } = req.body;
    
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update preferences
    users[userIndex].preferences = {
      ...users[userIndex].preferences,
      difficulty: difficulty || users[userIndex].preferences.difficulty,
      categories: categories || users[userIndex].preferences.categories,
      assistance: assistance !== undefined ? assistance : users[userIndex].preferences.assistance
    };

    res.json(users[userIndex].preferences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 