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

  if (!group) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-emerald-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading group info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{group.name}</h1>
              <p className="text-gray-600 text-lg mb-4">{group.description || 'No description'}</p>
              
              {/* Stats */}
              <div className="flex gap-8 justify-center lg:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{members.length}</div>
                  <div className="text-sm text-gray-500">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{expenses.length}</div>
                  <div className="text-sm text-gray-500">Expenses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">₹{totalAmount.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => navigate(`/groups/${groupId}/add-member`)} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Add Member</span>
              </button>
              <button 
                onClick={() => navigate(`/groups/${groupId}/add-expense`)} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Expense</span>
              </button>
              <button
                onClick={handleSettleUp}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Settle Up</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'expenses'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Expenses ({expenses.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'members'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Members ({members.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="text-6xl mb-4">💸</div>
                <h3 className="text-2xl font-bold text-gray-400 mb-2">No Expenses Yet</h3>
                <p className="text-gray-500 mb-6">Start by adding your first expense</p>
                <button
                  onClick={() => navigate(`/groups/${groupId}/add-expense`)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Add First Expense
                </button>
              </div>
            ) : (
              expenses.map((expense) => (
                <div
                  key={expense._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => navigate(`/expenses/${expense._id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{expense.description}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📅 {new Date(expense.createdAt).toLocaleDateString()}</span>
                        <span>🏷️ {expense.splitType}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">₹{expense.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Total Amount</div>
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
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">👤</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {member.userId?.name || member.name || 'Unknown Member'}
                </h3>
                <p className="text-sm text-gray-500">
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