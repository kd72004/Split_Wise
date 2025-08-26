import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-black via-gray-900 to-green-900 backdrop-blur-lg border-b border-green-500/20 shadow-lg">
      <div className="max-w-6xl mx-auto px-3 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
          <span className="text-2xl">💸</span>
          <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
            Splitwise
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden sm:flex items-center gap-4">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-1 text-gray-300 hover:text-green-400 transition-colors font-medium text-xs sm:text-sm"
          >
            <span>🏠</span> <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link 
            to="/create-group" 
            className="flex items-center gap-1 text-gray-300 hover:text-blue-400 transition-colors font-medium text-xs sm:text-sm"
          >
            <span>➕</span> <span className="hidden sm:inline">Create</span>
          </Link>
        </nav>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-lg border border-green-500/30 rounded-full px-3 py-1 hover:border-green-400/50 transition-all duration-300"
          >
            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
              U
            </div>
            <span className="text-gray-300 hidden md:block text-sm">Menu</span>
            <span className="text-gray-400 text-xs">▼</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-800/95 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl py-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors w-full text-left text-sm"
              >
                <span>🚪</span> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 