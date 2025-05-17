// File Path: /server/routes/game.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Puzzle = require('../models/Puzzle');
const router = express.Router();

// Middleware to authenticate requests
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// GET endpoint to fetch a puzzle (including daily challenge)
router.get('/puzzle', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log('Fetching puzzle for user:', {
      userId: user._id,
      username: user.username,
      educationLevel: user.educationLevel,
      preferredCodingLanguage: user.preferredCodingLanguage,
      seenPuzzlesCount: user.seenPuzzles.length,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const lastChallengeDate = user.lastDailyChallengeDate ? new Date(user.lastDailyChallengeDate) : null;
    const isNewDay = !lastChallengeDate || lastChallengeDate < today;

    let puzzle;
    if (isNewDay) {
      // Try to fetch a daily challenge puzzle
      let query = {
        educationLevel: user.educationLevel,
        isDailyChallenge: true,
        _id: { $nin: user.seenPuzzles || [] },
      };

      if (user.preferredCodingLanguage) {
        query.$or = [
          { type: { $ne: 'coding' } },
          { type: 'coding', language: user.preferredCodingLanguage },
        ];
      }

      let dailyPuzzles = await Puzzle.find(query);
      console.log('Daily challenge puzzles found:', dailyPuzzles.length);

      if (dailyPuzzles.length === 0) {
        // Fallback: Relax coding language filter
        query = {
          educationLevel: user.educationLevel,
          isDailyChallenge: true,
          _id: { $nin: user.seenPuzzles || [] },
        };
        dailyPuzzles = await Puzzle.find(query);
        console.log('Daily challenge puzzles found with relaxed filters:', dailyPuzzles.length);
      }

      if (dailyPuzzles.length > 0) {
        puzzle = dailyPuzzles[Math.floor(Math.random() * dailyPuzzles.length)];
        console.log('Selected daily challenge puzzle:', { puzzleId: puzzle._id, question: puzzle.question });
      }
    }

    // If no daily challenge or already completed, fetch a regular puzzle
    if (!puzzle) {
      let query = {
        educationLevel: user.educationLevel,
        _id: { $nin: user.seenPuzzles || [] },
        isDailyChallenge: false, // Exclude daily challenge puzzles
      };

      if (user.preferredCodingLanguage) {
        query.$or = [
          { type: { $ne: 'coding' } },
          { type: 'coding', language: user.preferredCodingLanguage },
        ];
      }

      let puzzles = await Puzzle.find(query);
      console.log('Regular puzzles found with strict filters:', puzzles.length);

      // Fallback: Relax coding language filter
      if (puzzles.length === 0) {
        console.log('No puzzles with strict filters, trying relaxed filters');
        query = {
          educationLevel: user.educationLevel,
          _id: { $nin: user.seenPuzzles || [] },
          isDailyChallenge: false,
        };
        puzzles = await Puzzle.find(query);
        console.log('Puzzles found with relaxed filters:', puzzles.length);
      }

      // Final fallback: Any puzzle
      if (puzzles.length === 0) {
        console.log('No puzzles found for education level, trying any puzzle');
        puzzles = await Puzzle.find({ _id: { $nin: user.seenPuzzles || [] }, isDailyChallenge: false });
        console.log('Puzzles found with ultimate fallback:', puzzles.length);
      }

      if (puzzles.length === 0) {
        console.log(`No new puzzles available for user ${user.username}`);
        return res.status(404).json({
          message: 'No new puzzles available. Please reset your seen puzzles or update your preferences.',
        });
      }

      puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    }

    // Ensure puzzle isn't already seen
    if (user.seenPuzzles.includes(puzzle._id)) {
      console.log('Selected puzzle already seen, this should not happen:', puzzle._id);
      return res.status(500).json({ message: 'Internal error: Duplicate puzzle detected.' });
    }

    user.seenPuzzles.push(puzzle._id);
    await user.save();
    console.log('Selected puzzle:', { puzzleId: puzzle._id, question: puzzle.question, isDailyChallenge: puzzle.isDailyChallenge });
    res.json(puzzle);
  } catch (err) {
    console.error('Error generating puzzle:', err.message, err.stack);
    res.status(500).json({ message: 'Server error while fetching puzzle' });
  }
});

// POST endpoint to submit an answer
router.post('/puzzle', authMiddleware, async (req, res) => {
  try {
    const { puzzle, answer } = req.body;
    if (!puzzle || !answer || !puzzle._id) {
      return res.status(400).json({ message: 'Invalid puzzle or answer' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isCorrect = answer.trim().toLowerCase() === puzzle.answer.toString().trim().toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update streak
    const lastStreakDate = user.lastStreakDate ? new Date(user.lastStreakDate) : null;
    const isSameDay = lastStreakDate && lastStreakDate.toDateString() === today.toDateString();

    if (isCorrect) {
      if (isSameDay) {
        user.streak += 1;
      } else {
        user.streak = 1;
      }
      user.lastStreakDate = today;

      // Award Streak Master badge
      if (user.streak >= 5 && !user.badges.includes('Streak Master')) {
        user.badges.push('Streak Master');
      }

      // Update score and puzzles solved
      let scoreIncrement = 10;
      if (puzzle.isDailyChallenge) {
        scoreIncrement += 20; // Bonus for daily challenge
        user.lastDailyChallengeDate = today;
      }
      user.score += scoreIncrement;
      user.puzzlesSolved += 1;

      // Update performance stats
      const puzzleType = puzzle.type;
      if (!user.performance.has(puzzleType)) {
        user.performance.set(puzzleType, { correct: 0, total: 0 });
      }
      const stats = user.performance.get(puzzleType);
      stats.correct += 1;
      stats.total += 1;
      user.performance.set(puzzleType, stats);

      // Check for mastered topics
      if (stats.correct >= 3 && !user.masteredTopics.includes(puzzleType)) {
        user.masteredTopics.push(puzzleType);
      }

      // Check for Puzzle Novice badge
      if (user.puzzlesSolved >= 5 && !user.badges.includes('Puzzle Novice')) {
        user.badges.push('Puzzle Novice');
      }
    } else {
      // Reset streak on incorrect answer
      user.streak = 0;
      user.lastStreakDate = today;

      // Update performance stats
      const puzzleType = puzzle.type;
      if (!user.performance.has(puzzleType)) {
        user.performance.set(puzzleType, { correct: 0, total: 0 });
      }
      const stats = user.performance.get(puzzleType);
      stats.total += 1;
      user.performance.set(puzzleType, stats);
    }

    await user.save();

    res.json({
      correct: isCorrect,
      message: isCorrect ? 'Correct! Great job!' : 'Incorrect answer, try again!',
      score: user.score,
      streak: user.streak,
      isDailyChallenge: puzzle.isDailyChallenge,
      badgesEarned: user.badges,
    });
  } catch (err) {
    console.error('Error processing puzzle:', err.message, err.stack);
    res.status(500).json({ message: 'Server error while submitting answer' });
  }
});

// GET endpoint to fetch a hint for a puzzle
router.get('/hint/:puzzleId', authMiddleware, async (req, res) => {
  try {
    const puzzle = await Puzzle.findById(req.params.puzzleId);
    if (!puzzle) return res.status(404).json({ message: 'Puzzle not found' });
    res.json({ hint: puzzle.hint });
  } catch (err) {
    console.error('Error fetching hint:', err.message, err.stack);
    res.status(500).json({ message: 'Server error while fetching hint' });
  }
});

// POST endpoint for feedback
router.post('/feedback', authMiddleware, async (req, res) => {
  try {
    const { feedback, puzzleId } = req.body;
    if (!feedback || !puzzleId) {
      return res.status(400).json({ message: 'Feedback and puzzle ID are required' });
    }
    console.log('Feedback received:', { feedback, puzzleId });
    res.json({ message: 'Feedback received!' });
  } catch (err) {
    console.error('Feedback error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error while submitting feedback' });
  }
});

// GET endpoint for progress
router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      score: user.score,
      puzzlesSolved: user.puzzlesSolved,
      badges: user.badges,
      masteredTopics: user.masteredTopics,
      streak: user.streak,
    });
  } catch (err) {
    console.error('Progress fetch error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error while fetching progress' });
  }
});

// GET endpoint for performance
router.get('/performance', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const performance = Object.fromEntries(user.performance);
    res.json(performance);
  } catch (err) {
    console.error('Performance fetch error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error while fetching performance' });
  }
});

// GET endpoint for leaderboard
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const users = await User.find()
      .sort({ score: -1 })
      .limit(10)
      .select('username score');
    res.json({ users });
  } catch (err) {
    console.error('Leaderboard fetch error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error while fetching leaderboard' });
  }
});

// Endpoint to reset seen puzzles
router.post('/reset-seen-puzzles', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.seenPuzzles = [];
    await user.save();
    res.json({ message: 'Seen puzzles reset successfully' });
  } catch (err) {
    console.error('Reset seen puzzles error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error while resetting seen puzzles' });
  }
});

module.exports = router;