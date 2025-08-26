import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UserGroups from '../components/UserGroups';
import axios from '../utils/axiosInstance';
import getUserId from '../utils/getUserId';
import { PageLoader } from '../components/LoadingSpinner';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalExpenses: 0,
    totalAmount: 0,
    pendingSettlements: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userId = getUserId();
        const token = localStorage.getItem('token');
        
        // Fetch user groups
        const groupsRes = await axios.get(`/group-memberships/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const groups = Array.isArray(groupsRes.data) ? groupsRes.data : [groupsRes.data];
        
        // Calculate stats from groups
        let totalExpenses = 0;
        let totalAmount = 0;
        
        for (const group of groups) {
          try {
            const expensesRes = await axios.get(`/expenses/group/${group._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            totalExpenses += expensesRes.data.length;
            totalAmount += expensesRes.data.reduce((sum, exp) => sum + exp.amount, 0);
          } catch (err) {
            console.log('Error fetching expenses for group:', group._id);
          }
        }
        
        setStats({
          totalGroups: groups.length,
          totalExpenses,
          totalAmount,
          pendingSettlements: Math.floor(totalExpenses * 0.3) // Mock calculation
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <PageLoader text="Loading your dashboard..." />;
  }

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-green-900 min-h-screen py-8 px-4">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-2">
            Welcome to Splitwise
          </h1>
          <p className="text-gray-300 text-lg">Manage your expenses smartly and settle up efficiently</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg border border-green-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">👥</div>
            <div className="text-xl font-bold text-green-400">{stats.totalGroups}</div>
            <div className="text-gray-300 text-xs">Groups</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg border border-blue-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-xl font-bold text-blue-400">{stats.totalExpenses}</div>
            <div className="text-gray-300 text-xs">Expenses</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg border border-purple-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-xl font-bold text-purple-400">₹{stats.totalAmount.toLocaleString()}</div>
            <div className="text-gray-300 text-xs">Total</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-lg border border-orange-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">⏳</div>
            <div className="text-xl font-bold text-orange-400">{stats.pendingSettlements}</div>
            <div className="text-gray-300 text-xs">Pending</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center mb-8">
          <Link
            to="/create-group"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <span className="text-xl">➕</span>
            Create New Group
          </Link>
        </div>
      </div>

      {/* Groups Section */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Groups</h2>
        <UserGroups />
      </div>
    </div>
  );
}