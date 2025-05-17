// File Path: /client/src/components/Signup.jsx
import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import React from 'react';

function Signup({ setUser }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredCodingLanguage, setPreferredCodingLanguage] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/signup', {
        username,
        email,
        password,
        preferredCodingLanguage,
        educationLevel,
      });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    }
  }, [username, email, password, preferredCodingLanguage, educationLevel, navigate, setUser]);

  return (
    <motion.div
      className="card mt-6 p-6 bg-gray-800 rounded-xl shadow-xl max-w-md mx-auto border border-green-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-white mb-4 font-mono">Sign Up</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input p-3 border-2 border-gray-600 rounded-lg bg-gray-700 text-white focus:border-green-500"
          required
          aria-label="Username"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input p-3 border-2 border-gray-600 rounded-lg bg-gray-700 text-white focus:border-green-500"
          required
          aria-label="Email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input p-3 border-2 border-gray-600 rounded-lg bg-gray-700 text-white focus:border-green-500"
          required
          aria-label="Password"
        />
        <select
          value={preferredCodingLanguage}
          onChange={(e) => setPreferredCodingLanguage(e.target.value)}
          className="input p-3 border-2 border-gray-600 rounded-lg bg-gray-700 text-white focus:border-green-500"
          aria-label="Preferred Coding Language"
        >
          <option value="">Select Coding Language</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>
        <select
          value={educationLevel}
          onChange={(e) => setEducationLevel(e.target.value)}
          className="input p-3 border-2 border-gray-600 rounded-lg bg-gray-700 text-white focus:border-green-500"
          required
          aria-label="Education Level"
        >
          <option value="">Select Education Level</option>
          <option value="primary">Primary School</option>
          <option value="high">High School</option>
          <option value="college">College Student</option>
          <option value="engineering">Engineering Graduate Student</option>
        </select>
        <button
          type="submit"
          className="btn bg-primary text-white py-2 rounded-lg hover:bg-blue-700 border border-green-500 hover:border-green-400 font-mono"
          aria-label="Sign Up"
        >
          Sign Up
        </button>
      </form>
      <p className="mt-4 text-center text-white">
        Already have an account?{' '}
        <Link to="/login" className="text-green-500 hover:underline font-mono">
          Log In
        </Link>
      </p>
    </motion.div>
  );
}

export default React.memo(Signup);