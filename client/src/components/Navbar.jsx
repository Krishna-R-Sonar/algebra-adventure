// File Path: /client/src/components/Navbar.jsx
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';

function Navbar({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/game', label: 'Game' },
    { path: '/tutor', label: 'Tutor' },
    { path: '/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <motion.nav
      className="bg-primary text-white shadow-lg"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold font-mono">∑ STEMZap</span>
          </div>
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium font-mono ${
                    isActive ? 'bg-blue-800 border border-green-500' : 'hover:bg-blue-700 hover:border hover:border-green-500'
                  }`
                }
                aria-label={`Navigate to ${item.label}`}
              >
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium font-mono bg-red-500 hover:bg-red-600 border border-red-500 hover:border-red-400"
              aria-label="Log out"
            >
              Logout
            </button>
          </div>
          <div className="sm:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-blue-700"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
        {isOpen && (
          <motion.div
            className="sm:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium font-mono ${
                      isActive ? 'bg-blue-800 border border-green-500' : 'hover:bg-blue-700 hover:border hover:border-green-500'
                    }`
                  }
                  onClick={toggleMenu}
                  aria-label={`Navigate to ${item.label}`}
                >
                  {item.label}
                </NavLink>
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium font-mono bg-red-500 hover:bg-red-600 border border-red-500 hover:border-red-400"
                aria-label="Log out"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}

export default Navbar;