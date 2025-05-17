// File Path: /server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  educationLevel: {
    type: String,
    required: true,
    enum: ['primary', 'high', 'college', 'engineering'],
    default: 'high',
  },
  preferredCodingLanguage: { type: String, enum: ['', 'python', 'javascript'], default: '' },
  score: { type: Number, default: 0 },
  puzzlesSolved: { type: Number, default: 0 },
  seenPuzzles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Puzzle' }],
  badges: [{ type: String }],
  masteredTopics: [{ type: String }],
  performance: {
    type: Map,
    of: new mongoose.Schema({
      correct: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    }),
    default: {},
  },
  streak: { type: Number, default: 0 }, // Tracks consecutive correct answers
  lastStreakDate: { type: Date }, // Last date a puzzle was solved for streak tracking
  preferredTheme: { type: String, enum: ['Adventure', 'Space', 'Underwater'], default: 'Adventure' }, // Theme preference
  lastDailyChallengeDate: { type: Date }, // Last date the daily challenge was completed
});

// Indexes for faster queries
userSchema.index({ seenPuzzles: 1 });
userSchema.index({ lastDailyChallengeDate: 1 });

module.exports = mongoose.model('User', userSchema);