import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import getUserId from '../utils/getUserId';

export default function SettlementList({ groupId, onClose }) {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settlingId, setSettlingId] = useState(null);
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
    setSettlingId(id);
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
    } finally {
      setSettlingId(null);
    }
  };

  const totalOwed = settlements
    .filter(s => !s.settled && String(s.payerId?._id) === String(userId))
    .reduce((sum, s) => sum + s.amountToPay, 0);

  const totalOwes = settlements
    .filter(s => !s.settled && String(s.userId?._id) === String(userId))
    .reduce((sum, s) => sum + s.amountToPay, 0);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-green-400 text-lg">Calculating settlements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-3xl w-full max-w-2xl shadow-2xl relative animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚖️</span>
            <div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                Settlement Summary
              </h2>
              <p className="text-gray-400 text-sm">Optimized debt settlements</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-gray-700/50 hover:bg-red-500/20 border border-gray-600 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all duration-300 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Summary Cards */}
        <div className="p-6 border-b border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">💰</div>
              <div className="text-xl font-bold text-green-400">₹{totalOwed.toLocaleString()}</div>
              <div className="text-xs text-gray-300">You'll Receive</div>
            </div>
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">💸</div>
              <div className="text-xl font-bold text-red-400">₹{totalOwes.toLocaleString()}</div>
              <div className="text-xs text-gray-300">You Need to Pay</div>
            </div>
          </div>
        </div>

        {/* Settlements List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {settlements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-400 mb-2">All Settled Up!</h3>
              <p className="text-gray-500">No pending settlements in this group</p>
            </div>
          ) : (
            <div className="space-y-3">
              {settlements.map((s, index) => {
                const isOwedToUser = String(s.payerId?._id) === String(userId);
                const isUserOwes = String(s.userId?._id) === String(userId);
                const isSettling = settlingId === s._id;
                
                return (
                  <div
                    key={s._id}
                    className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                      s.settled 
                        ? 'bg-gray-800/50 border-gray-600 opacity-60'
                        : isOwedToUser 
                        ? 'bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/30 hover:border-green-400/50'
                        : 'bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/30 hover:border-red-400/50'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          s.settled 
                            ? 'bg-gray-600 text-gray-400'
                            : isOwedToUser 
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {s.settled ? '✅' : isOwedToUser ? '💰' : '💸'}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {isOwedToUser && (
                              <span>
                                <span className="text-green-400">{s.userId?.name || 'Someone'}</span> owes you
                              </span>
                            )}
                            {isUserOwes && (
                              <span>
                                You owe <span className="text-red-400">{s.payerId?.name || 'Someone'}</span>
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-2">
                            <span>📅 {new Date(s.createdAt).toLocaleDateString()}</span>
                            {s.settled && <span className="text-green-400">• Settled</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`text-xl font-bold ${
                            s.settled 
                              ? 'text-gray-400'
                              : isOwedToUser 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            ₹{s.amountToPay.toLocaleString()}
                          </div>
                        </div>
                        
                        {!s.settled && (
                          <button
                            onClick={() => handleSettle(s._id)}
                            disabled={isSettling}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 disabled:scale-100 ${
                              isOwedToUser
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                          >
                            {isSettling ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Settling...
                              </>
                            ) : (
                              <>
                                <span>💳</span>
                                {isOwedToUser ? 'Mark Received' : 'Mark Paid'}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {settlements.length > 0 && (
          <div className="p-6 border-t border-gray-700 bg-gray-800/30">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>💡 Settlements are optimized to minimize transactions</span>
              <span>{settlements.filter(s => !s.settled).length} pending</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
