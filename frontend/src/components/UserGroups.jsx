import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import getUserId from '../utils/getUserId';
import { Link } from 'react-router-dom';

export default function UserGroups() {
  const [groups, setGroups] = useState([]);
  const [groupStats, setGroupStats] = useState({});

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const userId = getUserId();
        const token = localStorage.getItem('token');
        const res = await axios.get(`/group-memberships/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const groupsData = Array.isArray(res.data) ? res.data : [res.data];
        setGroups(groupsData);
        
        // Fetch stats for each group
        const stats = {};
        for (const group of groupsData) {
          try {
            const expensesRes = await axios.get(`/expenses/group/${group._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const membersRes = await axios.get(`/group-memberships/group/${group._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            stats[group._id] = {
              totalExpenses: expensesRes.data.length,
              totalAmount: expensesRes.data.reduce((sum, exp) => sum + exp.amount, 0),
              memberCount: Array.isArray(membersRes.data) ? membersRes.data.length : 1,
              lastActivity: expensesRes.data.length > 0 ? 
                new Date(Math.max(...expensesRes.data.map(e => new Date(e.createdAt)))).toLocaleDateString() : 
                'No activity'
            };
          } catch (err) {
            stats[group._id] = { totalExpenses: 0, totalAmount: 0, memberCount: 1, lastActivity: 'No activity' };
          }
        }
        setGroupStats(stats);
      } catch (err) {
        console.error('Error fetching groups:', err);
      }
    };
    fetchGroups();
  }, []);

  const getGroupIcon = (groupName) => {
    const lower = groupName.toLowerCase();
    if (lower.includes('project')) return '📚';
    if (lower.includes('expense')) return '💰';
    if (lower.includes('friends')) return '👫';
    if (lower.includes('family')) return '🏠';
    if (lower.includes('trip')) return '✈️';
    if (lower.includes('health')) return '🏥';
    return '📂';
  };

  const getGradientClass = (index) => {
    const gradients = [
      'from-green-500/20 to-green-600/20 border-green-500/30',
      'from-blue-500/20 to-blue-600/20 border-blue-500/30',
      'from-purple-500/20 to-purple-600/20 border-purple-500/30',
      'from-orange-500/20 to-orange-600/20 border-orange-500/30',
      'from-pink-500/20 to-pink-600/20 border-pink-500/30',
      'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30'
    ];
    return gradients[index % gradients.length];
  };

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-6xl mb-3">📂</div>
        <h3 className="text-xl font-bold text-gray-400 mb-2">No Groups Yet</h3>
        <p className="text-gray-500 mb-4">Create your first group to start splitting expenses</p>
        <Link
          to="/create-group"
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Create Your First Group
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto px-4">
      {groups.map((group, index) => {
        const stats = groupStats[group._id] || { totalExpenses: 0, totalAmount: 0, memberCount: 1, lastActivity: 'Loading...' };
        
        return (
          <Link
            key={group._id}
            to={`/groups/${group._id}`}
            className={`bg-gradient-to-br ${getGradientClass(index)} backdrop-blur-lg border rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-3xl">{getGroupIcon(group.name)}</div>
              <div className="flex items-center gap-1 text-gray-400">
                <span className="text-xs">👥</span>
                <span className="text-xs">{stats.memberCount}</span>
              </div>
            </div>
            
            {/* Group Info */}
            <h2 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
              {group.name}
            </h2>
            <p className="text-gray-300 text-xs mb-3 line-clamp-2">
              {group.description || 'No description available'}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-center">
                <div className="text-sm font-bold text-white">{stats.totalExpenses}</div>
                <div className="text-xs text-gray-400">Expenses</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-green-400">₹{stats.totalAmount.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
            </div>
            
            {/* Last Activity */}
            <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
              Last: {stats.lastActivity}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
