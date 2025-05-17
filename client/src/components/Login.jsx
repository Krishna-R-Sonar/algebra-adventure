// File Path: /client/src/components/Login.jsx
import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import React from 'react';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Sending login request:', { email });
      const res = await axios.post('/api/auth/login', {
        email,
        password,
      });
      console.log('Login response:', res.status, res.data);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(err.response?.data?.message || `Login failed: ${err.message}`);
    }
  }, [email, password, navigate, setUser]);

  return (
    <motion.div
      className="card mt-6 p-6 bg-gray-800 rounded-xl shadow-xl max-w-md mx-auto border border-green-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-white mb-4 font-mono">Log In</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
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
        <button
          type="submit"
          className="btn bg-primary text-white py-2 rounded-lg hover:bg-blue-700 border border-green-500 hover:border-green-400 font-mono"
          aria-label="Log In"
        >
          Log In
        </button>
      </form>
      <p className="mt-4 text-center text-white">
        Don't have an account?{' '}
        <Link to="/signup" className="text-green-500 hover:underline font-mono">
          Sign Up
        </Link>
      </p>
    </motion.div>
  );
}

export default React.memo(Login);