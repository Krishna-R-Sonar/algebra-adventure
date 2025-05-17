// File Path: /client/src/components/Login.jsx
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import React from 'react';

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { username, email, password, educationLevel });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to authenticate. Try again!');
    }
  }, [username, email, password, educationLevel, setUser]);

  return (
    <motion.div
      className="card mt-10 p-6 bg-gray-800 rounded-xl shadow-xl max-w-md mx-auto border border-green-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-white mb-4 font-mono">Login to STEMZap</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input w-full p-3 border-2 border-gray-600 rounded-lg bg-gray-700 text-white focus:border-green-500"
          required
          aria-label="Username"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input w-full p-3 border-2 border-gray-600 rounded-lg bg-gray-700 text-white focus:border-green-500"
          required
          aria-label="Email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input w-full p-3 border-2 border-gray-600 rounded-lg bg-gray-700 text-white focus:border-green-500"
          required
          aria-label="Password"
        />
        <select
          value={educationLevel}
          onChange={(e) => setEducationLevel(e.target.value)}
          className="input w-full p-3 border-2 border-gray-600 rounded-lg bg-gray-700 text-white focus:border-green-500"
          aria-label="Education Level"
        >
          <option value="">Select Education Level (Optional)</option>
          <option value="primary">Primary School</option>
          <option value="high">High School</option>
          <option value="college">College Student</option>
          <option value="engineering">Engineering Graduate Student</option>
        </select>
        <button
          type="submit"
          className="btn w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-700 border border-green-500 hover:border-green-400 font-mono"
          aria-label="Login"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-center text-white">
        New to the adventure?{' '}
        <Link to="/signup" className="text-green-500 hover:underline font-mono">
          Sign Up
        </Link>
      </p>
    </motion.div>
  );
}

export default React.memo(Login);