import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import getUserId from '../utils/getUserId';

export default function SettlementList({ groupId, onClose }) {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = getUserId();

  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/settlements/user?groupId=${groupId}&userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSettlements(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettlements();
  }, [groupId, userId]);

  const handleSettle = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/settlements/settle/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettlements(settlements =>
        settlements.map(s => s._id === id ? { ...s, settled: true } : s)
      );
    } catch (err) {
      alert('Failed to settle. Try again.');
    }
  };

  if (loading) return <div className="p-8 text-center text-green-400">Loading settlements...</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-lg shadow-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-green-400 text-center">Your Settlements</h2>
        {settlements.length === 0 && <p className="text-gray-400 text-center">No settlements found.</p>}
        <div className="space-y-4">
          {settlements.map(s => {
            const isOwedToUser = String(s.payerId?._id) === String(userId);
            const isUserOwes = String(s.userId?._id) === String(userId);
            let cardColor = '';
            if (s.settled) cardColor = 'bg-gray-700 opacity-60';
            else if (isOwedToUser) cardColor = 'bg-green-900 border-green-400';
            else if (isUserOwes) cardColor = 'bg-red-900 border-red-400';

            return (
              <div
                key={s._id}
                className={`flex justify-between items-center px-6 py-4 rounded-xl border-2 ${cardColor} shadow`}
              >
                <div>
                  {isOwedToUser && (
                    <span>
                      <span className="font-bold text-green-400">{s.userId?.name || 'Someone'}</span> owes you
                    </span>
                  )}
                  {isUserOwes && (
                    <span>
                      You owe <span className="font-bold text-red-400">{s.payerId?.name || 'Someone'}</span>
                    </span>
                  )}
                  <div className="text-gray-400 text-xs mt-1">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xl font-bold ${isOwedToUser ? 'text-green-400' : isUserOwes ? 'text-red-400' : ''}`}>
                    ₹{s.amountToPay}
                  </span>
                  {s.settled ? (
                    <span className="text-xs text-gray-300 mt-1">Already Paid</span>
                  ) : (
                    <button
                      className="mt-2 px-4 py-1 rounded-full bg-green-500 hover:bg-green-400 text-black font-bold text-xs"
                      onClick={() => handleSettle(s._id)}
                    >
                      Settle
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
