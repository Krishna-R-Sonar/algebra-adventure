// File Path: /client/src/components/Game.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function Game({ user, theme }) {
  const [puzzle, setPuzzle] = useState(null);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(user?.score || 0);
  const [streak, setStreak] = useState(user?.streak || 0);
  const [hint, setHint] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [badgesEarned, setBadgesEarned] = useState([]);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementMessage, setAchievementMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/');
    fetchPuzzle();
  }, [user, navigate]);

  const fetchPuzzle = async () => {
    try {
      const res = await axios.get('/api/game/puzzle', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPuzzle(res.data);
      setAnswer('');
      setMessage('');
      setShowHint(false);
      setHint('');
      localStorage.setItem('currentPuzzle', JSON.stringify(res.data));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load puzzle. Try refreshing.');
    }
  };

  const fetchHint = async () => {
    try {
      const res = await axios.get(`/api/game/hint/${puzzle._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setHint(res.data.hint);
      setShowHint(true);
    } catch (err) {
      setMessage('Failed to load hint. Try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        '/api/game/puzzle',
        { puzzle, answer },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessage(res.data.message);
      setScore(res.data.score);
      setStreak(res.data.streak);
      user.score = res.data.score;
      user.streak = res.data.streak;

      if (res.data.correct) {
        if (res.data.isDailyChallenge) {
          setAchievementMessage('🎉 Daily Challenge Completed! +20 Bonus Points!');
          setShowAchievement(true);
        }
        if (res.data.badgesEarned.length > 0) {
          const newBadges = res.data.badgesEarned.filter(
            (badge) => !badgesEarned.includes(badge)
          );
          if (newBadges.length > 0) {
            setBadgesEarned(res.data.badgesEarned);
            setAchievementMessage(`🏅 Badge Earned: ${newBadges.join(', ')}!`);
            setShowAchievement(true);
          }
        }
        setTimeout(fetchPuzzle, 1500);
      }
    } catch (err) {
      setMessage('Error submitting answer. Try again.');
    }
  };

  const handleFeedback = async () => {
    const feedback = prompt('Please provide your feedback on this puzzle:');
    if (feedback) {
      try {
        await axios.post(
          '/api/game/feedback',
          { feedback, puzzleId: puzzle._id },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        alert('Thank you for your feedback!');
      } catch (err) {
        alert('Failed to submit feedback. Try again.');
      }
    }
  };

  return (
    <motion.div
      className="container mx-auto p-6 text-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold mb-6">Game</h1>
      <p className="mb-4">
        Score: <span className="text-emerald-400">{score}</span> | Streak:{' '}
        <span className="text-emerald-400">{streak}</span>
        {streak > 0 && <span className="ml-2">🔥</span>}
      </p>

      {puzzle ? (
        <motion.div
          className={`bg-gray-800 p-6 rounded-lg shadow-lg ${
            puzzle.isDailyChallenge ? 'border-4 border-yellow-500' : ''
          }`}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {puzzle.isDailyChallenge && (
            <p className="text-yellow-400 font-bold mb-4">⭐ Daily Challenge! ⭐</p>
          )}
          <h2 className="text-2xl font-semibold mb-4">
            {puzzle.type.charAt(0).toUpperCase() + puzzle.type.slice(1)} Puzzle
          </h2>
          <p className="mb-4">{puzzle.question}</p>
          <form onSubmit={handleSubmit} className="mb-4">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="input bg-gray-700 text-gray-200 w-full mb-4"
              placeholder="Enter your answer"
              required
            />
            <div className="flex space-x-4">
              <button type="submit" className="btn bg-emerald-600 text-white">
                Submit Answer
              </button>
              <button
                type="button"
                onClick={fetchHint}
                className="btn bg-blue-600 text-white"
              >
                Get Hint
              </button>
              <button
                type="button"
                onClick={handleFeedback}
                className="btn bg-gray-600 text-white"
              >
                Provide Feedback
              </button>
            </div>
          </form>
          {showHint && (
            <motion.p
              className="text-blue-400 italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Hint: {hint}
            </motion.p>
          )}
          {message && (
            <motion.p
              className={`mt-4 ${message.includes('Correct') ? 'text-emerald-400' : 'text-red-500'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      ) : (
        <p>Loading puzzle...</p>
      )}

      {/* Achievement Popup */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            className="achievement-popup"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold">Achievement Unlocked!</h3>
            <p>{achievementMessage}</p>
            <button
              onClick={() => setShowAchievement(false)}
              className="btn bg-white text-gray-800 mt-4"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Game;