// File Path: /server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, email, password, preferredCodingLanguage, educationLevel, preferredTheme } = req.body;
  try {
    if (!username || !email || !password || !educationLevel) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      email,
      password: hashedPassword,
      preferredCodingLanguage,
      educationLevel,
      preferredTheme: preferredTheme || 'Adventure',
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      user: {
        id: user._id,
        username,
        email,
        score: user.score,
        preferredCodingLanguage,
        educationLevel,
        preferredTheme: user.preferredTheme,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error('Signup error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password, educationLevel } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    if (educationLevel && educationLevel !== user.educationLevel) {
      user.educationLevel = educationLevel;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      user: {
        id: user._id,
        username,
        email: user.email,
        score: user.score,
        preferredCodingLanguage: user.preferredCodingLanguage,
        educationLevel: user.educationLevel,
        preferredTheme: user.preferredTheme,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.get('/verify', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        score: user.score,
        preferredCodingLanguage: user.preferredCodingLanguage,
        educationLevel: user.educationLevel,
        preferredTheme: user.preferredTheme,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error('Verify token error:', error.message, error.stack);
    res.status(401).json({ message: 'Invalid token, please log in again' });
  }
});

router.post('/update', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { preferredCodingLanguage, educationLevel, preferredTheme } = req.body;
    if (preferredCodingLanguage !== undefined) {
      user.preferredCodingLanguage = preferredCodingLanguage;
    }
    if (educationLevel) {
      user.educationLevel = educationLevel;
      user.seenPuzzles = []; // Reset seenPuzzles on educationLevel change
    }
    if (preferredTheme) {
      user.preferredTheme = preferredTheme;
    }

    await user.save();
    res.json({
      message: 'Preferences updated',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        preferredCodingLanguage: user.preferredCodingLanguage,
        educationLevel: user.educationLevel,
        preferredTheme: user.preferredTheme,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error('Update preferences error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error during preference update' });
  }
});

module.exports = router;