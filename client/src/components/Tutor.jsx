// File Path: /client/src/components/Tutor.jsx
import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function Tutor() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a question!');
      return;
    }
    if (query.length > 500) {
      setError('Question is too long. Please keep it under 500 characters.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await axios.post(
        '/api/tutor',
        { query },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, timeout: 10000 }
      );
      setResponse(res.data.response);
    } catch (err) {
      console.error('Tutor fetch error:', err);
      setError(err.response?.data?.message || 'Error fetching response. Try again!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError('');
    setResponse('');
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <motion.div
      className="card mt-6 p-4 sm:p-6 bg-gray-800 rounded-xl shadow-xl max-w-4xl mx-auto border border-green-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="region"
      aria-label="AI Tutor Interface"
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-mono">∂ AI Tutor</h2>
      <p className="text-lg sm:text-xl text-gray-300">
        Ask Alex the Explorer (powered by Gemini AI) about algebra or STEM puzzles!
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col space-y-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question (e.g., How do I solve 2x + 3 = 7?)"
          className="input text-base sm:text-lg p-3 border-2 border-gray-600 rounded-lg bg-gray-700 text-white focus:border-green-500"
          aria-label="Tutor Question Input"
          aria-describedby={error ? 'tutor-error' : undefined}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="btn bg-primary text-white text-base sm:text-lg py-2 px-4 rounded-lg hover:bg-blue-700 border border-green-500 hover:border-green-400 font-mono"
          disabled={isLoading}
          aria-label="Submit Question"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Asking...
            </span>
          ) : (
            'Ask Alex'
          )}
        </button>
      </form>
      {error && (
        <div className="mt-4" id="tutor-error">
          <p className="text-lg text-red-500">{error}</p>
          <button
            onClick={handleRetry}
            className="btn mt-2 bg-yellow-500 text-white text-base sm:text-lg py-2 px-4 rounded-lg hover:bg-yellow-600 border border-yellow-500 hover:border-yellow-400 font-mono"
            aria-label="Retry Tutor Request"
          >
            Retry
          </button>
        </div>
      )}
      {response && (
        <motion.div
          className="mt-4 p-4 bg-gray-700 rounded-lg border border-green-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white font-mono">Alex's Answer:</h3>
          <pre className="text-base sm:text-lg whitespace-pre-wrap text-gray-300">{response}</pre>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Tutor;