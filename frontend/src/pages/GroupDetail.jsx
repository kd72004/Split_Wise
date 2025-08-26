import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import SettlementList from '../components/SettlementList';

export default function GroupDetail() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [showSettlements, setShowSettlements] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGroup(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/expenses/group/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExpenses(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/group-memberships/group/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMembers(Array.isArray(res.data) ? res.data : [res.data]);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchGroup();
    fetchExpenses();
    fetchMembers();
  }, [groupId]);

  const handleSettleUp = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/settlements/${groupId}`,
        { transactions: [] },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowSettlements(true);
    } catch (err) {
      console.error('Settlement error:', err);
      alert('Failed to settle up. Please try again.');
    }
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgExpense = expenses.length > 0 ? totalAmount / expenses.length : 0;

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-green-400 text-xl">Loading group info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900">
      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-lg border border-green-500/30 rounded-3xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-2">
                {group.name}
              </h1>
              <p className="text-gray-300 text-lg mb-4">{group.description || 'No description'}</p>
              
              {/* Stats */}
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{members.length}</div>
                  <div className="text-sm text-gray-400">Members</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{expenses.length}</div>
                  <div className="text-sm text-gray-400">Expenses</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">₹{totalAmount.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total</div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => navigate(`/groups/${groupId}/add-member`)} 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <span>👥</span> Add Member
              </button>
              <button 
                onClick={() => navigate(`/groups/${groupId}/add-expense`)} 
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <span>💰</span> Add Expense
              </button>
              <button
                onClick={handleSettleUp}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <span>⚖️</span> Settle Up
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'expenses'
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            📊 Expenses ({expenses.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'members'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            👥 Members ({members.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">💸</div>
                <h3 className="text-2xl font-bold text-gray-400 mb-2">No Expenses Yet</h3>
                <p className="text-gray-500 mb-6">Start by adding your first expense</p>
                <button
                  onClick={() => navigate(`/groups/${groupId}/add-expense`)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Add First Expense
                </button>
              </div>
            ) : (
              expenses.map((expense, index) => (
                <div
                  key={expense._id}
                  className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                  onClick={() => navigate(`/expenses/${expense._id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">💰</span>
                        <h3 className="text-xl font-semibold text-white">{expense.description}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>📅 {new Date(expense.createdAt).toLocaleDateString()}</span>
                        <span>🏷️ {expense.splitType}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">₹{expense.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Total Amount</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member, index) => (
              <div
                key={member._id || index}
                className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-6 text-center"
              >
                <div className="text-4xl mb-3">👤</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {member.userId?.name || member.name || 'Unknown Member'}
                </h3>
                <p className="text-sm text-gray-400">
                  {member.userId?.email || member.email || 'No email'}
                </p>
              </div>
            ))}
          </div>
        )}

        {showSettlements && (
          <SettlementList groupId={groupId} onClose={() => setShowSettlements(false)} />
        )}
      </div>
    </div>
  );
}
