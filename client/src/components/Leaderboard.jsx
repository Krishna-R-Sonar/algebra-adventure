// File Path: /client/src/components/Leaderboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get('/api/game/leaderboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setLeaders(res.data.users || []);
      setError('');
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setError('Failed to load leaderboard. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    fetchLeaderboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-200 text-lg sm:text-xl md:text-2xl font-mono">
        Loading leaderboard...
      </div>
    );
  }

  return (
    <motion.div
      className="card mt-6 p-4 sm:p-6 md:p-8 bg-gray-800 rounded-xl shadow-xl max-w-full sm:max-w-3xl md:max-w-4xl xl:max-w-5xl mx-auto border border-green-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="region"
      aria-label="Leaderboard Interface"
    >
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 font-mono tracking-tight">
        ∑ Top Adventurers
      </h2>
      <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-6">
        See who’s conquering STEMZap!
      </p>
      {error && (
        <div className="mt-4">
          <p className="text-base sm:text-lg md:text-xl text-red-500">{error}</p>
        </div>
      )}
      {leaders.length > 0 ? (
        <ul className="space-y-4">
          {leaders.map((leader, index) => (
            <motion.li
              key={leader._id}
              className="flex justify-between items-center bg-gray-700 p-4 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="text-lg sm:text-xl md:text-2xl text-white">
                {index + 1}. {leader.username}
              </span>
              <span className="text-lg sm:text-xl md:text-2xl text-emerald-400">
                {leader.score} points
              </span>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-base sm:text-lg md:text-xl text-gray-200">
          No leaderboard data available yet.
        </p>
      )}
    </motion.div>
  );
}

export default Leaderboard;