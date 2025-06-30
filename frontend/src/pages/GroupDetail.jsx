import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import SettlementList from '../components/SettlementList';

export default function GroupDetail() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [showSettlements, setShowSettlements] = useState(false);
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
    fetchGroup();
    fetchExpenses();
  }, [groupId]);

  const handleSettleUp = async () => {
    try {
      const token = localStorage.getItem('token');
      // Call the settlement API with an empty transactions array to trigger backend to use only existing expenses
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

  if (!group) return <div className="p-8 text-center text-green-400">Loading group info...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto py-8 px-6">
        <div className="flex flex-col gap-4 items-center mb-8">
          <h1 className="text-4xl font-bold text-green-400">{group.name}</h1>
          <p className="text-gray-400">{group.description}</p>
          <div className="flex gap-4 mt-4">
            <button onClick={() => navigate(`/groups/${groupId}/add-member`)} className="px-5 py-2 rounded-full bg-green-500 hover:bg-green-400 transition font-bold">Add Member</button>
            <button onClick={() => navigate(`/groups/${groupId}/add-expense`)} className="px-5 py-2 rounded-full bg-green-500 hover:bg-green-400 transition font-bold">Add Expense</button>
            <button
              className="px-5 py-2 rounded-full bg-green-500 hover:bg-green-400 transition font-bold"
              onClick={handleSettleUp}
            >
              Settle Up
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {expenses.length === 0 && <p className="text-gray-400 text-center">No expenses yet.</p>}
          {expenses.map(expense => (
            <div
              key={expense._id}
              className="flex justify-between bg-gray-800 px-6 py-4 rounded-2xl shadow hover:bg-gray-700 transition cursor-pointer"
              onClick={() => navigate(`/expenses/${expense._id}`)}
            >
              <div>
                <p className="text-xl font-semibold">{expense.description}</p>
                <p className="text-gray-400 text-sm">{new Date(expense.createdAt).toLocaleDateString()}</p>
              </div>
              <p className="text-xl font-bold text-green-400">₹{expense.amount}</p>
            </div>
          ))}
        </div>
        {showSettlements && (
          <SettlementList groupId={groupId} onClose={() => setShowSettlements(false)} />
        )}
      </div>
    </div>
  );
}
