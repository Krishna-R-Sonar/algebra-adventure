// File Path: /server/routes/tutor.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ message: 'Invalid token, try logging in again' });
  }
};

router.post('/', authMiddleware, async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ message: 'Valid query is required' });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in .env');
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const sanitizedQuery = query.trim().replace(/[<>{}]/g, ''); // Basic sanitization
    const result = await model.generateContent([
      {
        text: `You are Alex the Explorer, an AI tutor for STEMZap. Provide clear, concise, and engaging answers to STEM-related questions, focusing on algebra. Use a friendly tone, avoid complex jargon, and include simple examples where possible. If the question is unclear, ask for clarification politely. Question: ${sanitizedQuery}`,
      },
    ]);

    const answer = result.response.text() || 'No response generated.';
    console.log('Tutor response generated:', { query: sanitizedQuery, answer });
    res.json({ response: answer });
  } catch (error) {
    console.error('Tutor fetch error:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching tutor response, try again' });
  }
});

module.exports = router;