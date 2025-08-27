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
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to Splitwise
            </h1>
            <p className="text-xl text-gray-600">Manage your expenses and settle up with ease</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-emerald-600 mb-1">{stats.totalGroups}</div>
              <div className="text-gray-600 text-sm">Active Groups</div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalExpenses}</div>
              <div className="text-gray-600 text-sm">Total Expenses</div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">₹{stats.totalAmount.toLocaleString()}</div>
              <div className="text-gray-600 text-sm">Total Amount</div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-orange-600 mb-1">{stats.pendingSettlements}</div>
              <div className="text-gray-600 text-sm">Pending</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="text-center">
            <Link
              to="/create-group"
              className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-2xl transition-colors shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Group
            </Link>
          </div>
        </div>
      </div>

      {/* Groups Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Groups</h2>
          <Link
            to="/create-group"
            className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            View All →
          </Link>
        </div>
        <UserGroups />
      </div>
    </div>
  );
}