// File Path: /client/src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import Game from './components/Game';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import Tutor from './components/Tutor';
import axios from 'axios';

// Use the Render server URL for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://algebra-adventure.onrender.com';

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('Adventure'); // Default theme

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${API_BASE_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data.user);
          setTheme(res.data.user.preferredTheme || 'Adventure');
        })
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentPuzzle');
    setUser(null);
    setTheme('Adventure');
  };

  // Apply theme to the body
  useEffect(() => {
    document.body.className = `theme-${theme.toLowerCase()}`;
  }, [theme]);

  return (
    <Router>
      <div className={`min-h-screen theme-${theme.toLowerCase()}`}>
        <Navbar user={user} onLogout={handleLogout} theme={theme} />
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup setUser={setUser} setTheme={setTheme} />} />
          <Route path="/game" element={user ? <Game user={user} theme={theme} /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} theme={theme} setTheme={setTheme} /> : <Navigate to="/login" />} />
          <Route path="/leaderboard" element={user ? <Leaderboard theme={theme} /> : <Navigate to="/login" />} />
          <Route path="/tutor" element={user ? <Tutor theme={theme} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;