// File Path: /server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  console.log('Signup route hit:', req.body); // Log request body
  try {
    const { username, email, password, preferredCodingLanguage, educationLevel } = req.body;

    // Validate required fields
    if (!username || !email || !password || !educationLevel) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      preferredCodingLanguage: preferredCodingLanguage || '',
      educationLevel,
      preferredTheme: 'Adventure', // Default theme
      score: 0,
      streak: 0,
    });

    await user.save();
    console.log('User created:', email);

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, user: { id: user._id, username, email, score: user.score, preferredCodingLanguage, educationLevel, preferredTheme: user.preferredTheme, streak: user.streak } });
  } catch (err) {
    console.error('Signup error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  console.log('Login route hit:', req.body); // Log request body
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Login successful:', email);
    res.json({ token, user: { id: user._id, username: user.username, email, score: user.score, preferredCodingLanguage: user.preferredCodingLanguage, educationLevel: user.educationLevel, preferredTheme: user.preferredTheme, streak: user.streak } });
  } catch (err) {
    console.error('Login error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token route
router.get('/verify', async (req, res) => {
  console.log('Verify route hit');
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ message: 'Invalid token' });
    }

    console.log('Token verified for user:', user.email);
    res.json({ user: { id: user._id, username: user.username, email: user.email, score: user.score, preferredCodingLanguage: user.preferredCodingLanguage, educationLevel: user.educationLevel, preferredTheme: user.preferredTheme, streak: user.streak } });
  } catch (err) {
    console.error('Verify error:', err.message, err.stack);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;