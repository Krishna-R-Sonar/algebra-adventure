// File Path: /server/models/Puzzle.js
const mongoose = require('mongoose');

const puzzleSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['linear', 'fraction', 'coding'],
  },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  curriculum: { type: String, required: true },
  standard: { type: String, required: true },
  topic: { type: String, required: true },
  theme: { type: String, default: 'Adventure' },
  language: { type: String, default: 'English' },
  educationLevel: {
    type: [String],
    required: true,
    enum: ['primary', 'high', 'college', 'engineering'],
  },
  hint: { type: String, default: 'No hint available.' }, // New field for hints
  isDailyChallenge: { type: Boolean, default: false }, // Flag for daily challenge puzzles
});

module.exports = mongoose.model('Puzzle', puzzleSchema);