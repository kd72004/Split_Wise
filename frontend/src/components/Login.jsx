import { useState } from 'react';
import axios from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { ButtonLoader } from '../components/LoadingSpinner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const res = await axios.post('/users/login', { email, password });
      localStorage.setItem('token', res.data.token);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-black to-green-900 relative overflow-hidden p-0 m-0">
      {/* Decorative background blobs */}
      <div className="absolute w-[32rem] h-[32rem] bg-green-400 opacity-20 rounded-full -top-32 -left-32 blur-3xl animate-pulse" />
      <div className="absolute w-[28rem] h-[28rem] bg-primary opacity-10 rounded-full -bottom-24 -right-24 blur-2xl animate-pulse" />
      <form onSubmit={handleLogin} className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-16 w-[32rem] flex flex-col gap-8">
        <div className="flex flex-col items-center mb-2">
          <span className="text-5xl mb-2">💸</span>
          <h2 className="text-3xl font-extrabold text-primary drop-shadow mb-1 text-amber-50">Splitwise</h2>
          <span className="text-green-400 text-sm">Welcome back! Please login.</span>
        </div>
        <div className="relative">
          <FaEnvelope className="absolute left-4 top-5 text-gray-400 text-xl" />
          <input 
            type="email" 
            value={email} 
            onChange={e => {setEmail(e.target.value); setErrors({...errors, email: ''});}} 
            placeholder="Email"
            className={`w-full pl-12 h-16 p-4 rounded-xl bg-gray-800/70 border text-white focus:ring-2 focus:ring-primary outline-none transition ${
              errors.email ? 'border-red-500' : 'border-gray-700'
            }`} 
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>
        <div className="relative">
          <FaLock className="absolute left-4 top-5 text-gray-400 text-xl" />
          <input 
            type={showPassword ? 'text' : 'password'} 
            value={password} 
            onChange={e => {setPassword(e.target.value); setErrors({...errors, password: ''});}} 
            placeholder="Password"
            className={`w-full pl-12 pr-12 h-16 p-4 rounded-xl bg-gray-800/70 border text-white focus:ring-2 focus:ring-primary outline-none transition ${
              errors.password ? 'border-red-500' : 'border-gray-700'
            }`} 
          />
          <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-5 text-gray-400 hover:text-primary focus:outline-none text-xl">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary text-green-400 font-bold py-4 rounded-xl hover:bg-green-600 transition-all duration-200 shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <ButtonLoader />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
        <div className="text-center text-green-400 text-sm mt-2">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:underline">Sign Up</Link>
        </div>
      </form>
    </div>
  );
}


