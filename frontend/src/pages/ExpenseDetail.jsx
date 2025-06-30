import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';

export default function ExpenseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/expenses/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExpense(res.data);
      } catch (err) {
        console.error('Error fetching expense', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading expense...</div>;
  if (!expense) return <div className="p-8 text-center text-red-400">Expense not found</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <button onClick={() => navigate(-1)} className="mb-4 bg-green-500 text-black px-4 py-2 rounded">
        ← Back
      </button>
      <div className="max-w-xl mx-auto bg-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-2xl font-bold text-green-400">{expense.description}</h2>
        <p className="text-gray-400">Amount: ₹{expense.amount}</p>
        <p className="text-gray-400">
          Date: {new Date(expense.date).toLocaleDateString()}
        </p>

        <div>
          <h3 className="text-xl font-semibold">Paid By:</h3>
          <ul className="mt-2 space-y-2">
            {expense.paidBy.map((p) => (
              <li key={p.userId._id} className="flex justify-between bg-gray-700 px-4 py-2 rounded">
                <span>{p.userId.name}</span>
                <span>₹{p.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold">Split Among:</h3>
          <ul className="mt-2 space-y-2">
            {expense.splitMember.map((s) => (
              <li key={s.userId._id} className="flex justify-between bg-gray-700 px-4 py-2 rounded">
                <span>{s.userId.name}</span>
                <span>₹{s.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-gray-400">Split Type: {expense.splitType}</p>
      </div>
    </div>
  );
}
