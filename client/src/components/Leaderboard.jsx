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
      setError('Failed to load leaderboard. Try again!');
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
    return <div className="text-center mt-10 text-gray-200 text-lg sm:text-xl md:text-2xl font-mono">Loading leaderboard...</div>;
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
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 font-mono tracking-tight">∑ Top Adventurers</h2>
      <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-6">See who’s conquering STEMZap!</p>
      {error && (
        <div className="mt-4">
          <p className="text-base sm:text-lg md:text-xl text-red-500 font-mono">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="btn mt-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 font-mono text-sm sm:text-base md:text-lg"
          >
            Retry
          </button>
        </div>
      )}
      {leaders.length > 0 ? (
        <ul className="mt-4 list-none pl-0 text-gray-200 space-y-3">
          {leaders.map((leader, index) => (
            <li
              key={index}
              className="text-base sm:text-lg md:text-xl font-mono p-3 bg-gray-700 rounded-lg flex justify-between items-center"
            >
              <span>
                <span className="text-yellow-400 font-bold">{index + 1}.</span>{' '}
                <span className="text-green-400">{leader.username}</span>
              </span>
              <span>{leader.score} points</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-200 font-mono">No adventurers on the leaderboard yet!</p>
      )}
    </motion.div>
  );
}

export default Leaderboard;