// File Path: /client/src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard({ user, theme, setTheme }) {
  const [progress, setProgress] = useState({ score: 0, puzzlesSolved: 0, badges: [], masteredTopics: [], streak: 0 });
  const [performance, setPerformance] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [preferredCodingLanguage, setPreferredCodingLanguage] = useState(user?.preferredCodingLanguage || '');
  const [educationLevel, setEducationLevel] = useState(user?.educationLevel || 'high');
  const [preferredTheme, setPreferredTheme] = useState(user?.preferredTheme || 'Adventure');
  const [error, setError] = useState('');
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/');
    fetchProgress();
    fetchPerformance();
    fetchLeaderboard();
    updateMotivationalMessage();
  }, [user, navigate]);

  const fetchProgress = async () => {
    try {
      const res = await axios.get('/api/game/progress', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setProgress(res.data);
    } catch (err) {
      console.error('Fetch progress error:', err);
      setError(err.response?.data?.message || 'Failed to load progress. Try refreshing.');
    }
  };

  const fetchPerformance = async () => {
    try {
      const res = await axios.get('/api/game/performance', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPerformance(res.data);
    } catch (err) {
      console.error('Fetch performance error:', err);
      setError(err.response?.data?.message || 'Failed to load performance data. Try refreshing.');
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get('/api/game/leaderboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setLeaderboard(res.data.users || []);
    } catch (err) {
      console.error('Fetch leaderboard error:', err);
      setError(err.response?.data?.message || 'Failed to load leaderboard. Try refreshing.');
    }
  };

  const handlePreferencesChange = async () => {
    try {
      const res = await axios.post(
        '/api/auth/update',
        { preferredCodingLanguage, educationLevel, preferredTheme },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setError('');
      alert('Preferences updated successfully!');
      user.preferredCodingLanguage = res.data.user.preferredCodingLanguage;
      user.educationLevel = res.data.user.educationLevel;
      user.preferredTheme = res.data.user.preferredTheme;
      setTheme(res.data.user.preferredTheme);
    } catch (err) {
      console.error('Update preferences error:', err);
      setError('Failed to update preferences. Try again.');
    }
  };

  const handleResetPuzzles = async () => {
    try {
      await axios.post(
        '/api/game/reset-seen-puzzles',
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setError('');
      alert('Puzzles reset! You can now play new puzzles.');
    } catch (err) {
      console.error('Reset puzzles error:', err);
      setError('Failed to reset puzzles. Try again.');
    }
  };

  const updateMotivationalMessage = () => {
    if (progress.streak >= 5) {
      setMotivationalMessage("🔥 You're on fire! Keep up the amazing streak!");
    } else if (progress.puzzlesSolved >= 10) {
      setMotivationalMessage("🎉 Wow, you've solved 10 puzzles! You're a STEM star!");
    } else if (progress.puzzlesSolved > 0) {
      setMotivationalMessage("Great job! Keep solving puzzles to build your streak!");
    } else {
      setMotivationalMessage("Let's get started! Solve your first puzzle today!");
    }
  };

  const handleShareAchievement = (achievement) => {
    const shareText = `I just earned the "${achievement}" badge on STEMZap! 🚀 Join me and test your skills! #STEMZap #Learning`;
    const url = 'https://algebra-adventure.vercel.app';
    if (navigator.share) {
      navigator.share({
        title: 'STEMZap Achievement',
        text: shareText,
        url,
      }).catch((err) => console.error('Share error:', err));
    } else {
      navigator.clipboard.writeText(`${shareText} ${url}`)
        .then(() => alert('Achievement copied to clipboard! Share it with your friends.'))
        .catch((err) => console.error('Clipboard error:', err));
    }
  };

  const renderPerformanceChart = () => {
    const labels = Object.keys(performance);
    const correctData = labels.map((type) => {
      const stats = performance[type] || { correct: 0, total: 0 };
      return stats.correct;
    });
    const totalData = labels.map((type) => {
      const stats = performance[type] || { correct: 0, total: 0 };
      return stats.total;
    });

    const data = {
      labels,
      datasets: [
        {
          label: 'Correct Answers',
          data: correctData,
          backgroundColor: theme === 'Adventure' ? 'rgba(245, 158, 11, 0.6)' : theme === 'Space' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(2, 132, 199, 0.6)',
          borderColor: theme === 'Adventure' ? 'rgba(245, 158, 11, 1)' : theme === 'Space' ? 'rgba(59, 130, 246, 1)' : 'rgba(2, 132, 199, 1)',
          borderWidth: 1,
        },
        {
          label: 'Total Attempts',
          data: totalData,
          backgroundColor: theme === 'Adventure' ? 'rgba(180, 83, 9, 0.6)' : theme === 'Space' ? 'rgba(75, 85, 99, 0.6)' : 'rgba(7, 89, 133, 0.6)',
          borderColor: theme === 'Adventure' ? 'rgba(180, 83, 9, 1)' : theme === 'Space' ? 'rgba(75, 85, 99, 1)' : 'rgba(7, 89, 133, 1)',
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Performance by Puzzle Type', color: '#e2e8f0' },
      },
      scales: {
        x: { ticks: { color: '#e2e8f0' } },
        y: {
          beginAtZero: true,
          ticks: { color: '#e2e8f0', stepSize: 1 },
        },
      },
    };

    return <Bar data={data} options={options} />;
  };

  return (
    <motion.div
      className="container mx-auto p-6 text-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Motivational Message */}
      <motion.div
        className={`p-4 rounded-lg mb-6 ${
          theme === 'Adventure' ? 'bg-gradient-to-r from-amber-600 to-amber-800' :
          theme === 'Space' ? 'bg-gradient-to-r from-blue-600 to-indigo-800' :
          'bg-gradient-to-r from-cyan-600 to-blue-800'
        }`}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-lg">{motivationalMessage}</p>
      </motion.div>

      {/* Progress Section */}
      <motion.div
        className="card bg-gray-800 p-6 rounded-lg shadow-lg mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold mb-4">Your Progress</h2>
        <p>Score: <span className="text-emerald-400">{progress.score}</span></p>
        <p>Puzzles Solved: <span className="text-emerald-400">{progress.puzzlesSolved}</span></p>
        <p>
          Streak: <span className="text-emerald-400">{progress.streak}</span>
          {progress.streak > 0 && <span className="ml-2">🔥</span>}
        </p>
        <p>Badges: <span className="text-emerald-400">{progress.badges.join(', ') || 'None'}</span></p>
        <p>Mastered Topics: <span className="text-emerald-400">{progress.masteredTopics.join(', ') || 'None'}</span></p>

        {/* Share Achievements */}
        {progress.badges.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Share Your Achievements</h3>
            {progress.badges.map((badge, index) => (
              <button
                key={index}
                onClick={() => handleShareAchievement(badge)}
                className={`btn text-white mr-2 mt-2 ${
                  theme === 'Adventure' ? 'bg-amber-600 hover:bg-amber-700' :
                  theme === 'Space' ? 'bg-blue-600 hover:bg-blue-700' :
                  'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                Share {badge}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Performance Chart */}
      {Object.keys(performance).length > 0 && (
        <motion.div
          className="card bg-gray-800 p-6 rounded-lg shadow-lg mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold mb-4">Your Performance</h2>
          {renderPerformanceChart()}
        </motion.div>
      )}

      {/* Leaderboard */}
      <motion.div
        className="card bg-gray-800 p-6 rounded-lg shadow-lg mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-2xl font-semibold mb-4">Leaderboard</h2>
        {leaderboard.length > 0 ? (
          <ul>
            {leaderboard.map((entry, index) => (
              <li key={index} className="mb-2">
                {index + 1}. {entry.username}: <span className="text-emerald-400">{entry.score}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No leaderboard data available.</p>
        )}
      </motion.div>

      {/* Preferences Form */}
      <motion.div
        className="card bg-gray-800 p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h2 className="text-2xl font-semibold mb-4">Preferences</h2>
        <div className="mb-4">
          <label className="block mb-2">Preferred Coding Language:</label>
          <select
            value={preferredCodingLanguage}
            onChange={(e) => setPreferredCodingLanguage(e.target.value)}
            className="input bg-gray-700 text-gray-200 w-full"
          >
            <option value="">None</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Education Level:</label>
          <select
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            className="input bg-gray-700 text-gray-200 w-full"
          >
            <option value="primary">Primary</option>
            <option value="high">High School</option>
            <option value="college">College</option>
            <option value="engineering">Engineering</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Theme:</label>
          <select
            value={preferredTheme}
            onChange={(e) => setPreferredTheme(e.target.value)}
            className="input bg-gray-700 text-gray-200 w-full"
          >
            <option value="Adventure">Adventure</option>
            <option value="Space">Space</option>
            <option value="Underwater">Underwater</option>
          </select>
        </div>
        <button onClick={handlePreferencesChange} className="btn text-white">
          Update Preferences
        </button>
        <button onClick={handleResetPuzzles} className="btn bg-red-600 text-white ml-4">
          Reset Puzzles
        </button>
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;
