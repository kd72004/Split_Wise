import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-black via-black to-green-900 shadow-lg px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-3xl">💸</span>
        <span className="text-2xl font-extrabold text-primary tracking-wide">Splitwise</span>
      </div>
      <nav className="flex gap-6 text-green-300 font-semibold text-lg">
        <Link to="/dashboard" className="hover:text-green-400 transition">Dashboard</Link>
        <Link to="/create-group" className="hover:text-green-400 transition">Create Group</Link>
      </nav>
    </header>
  );
} 