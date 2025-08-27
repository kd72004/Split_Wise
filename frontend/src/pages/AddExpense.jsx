import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';

export default function AddExpense() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState('equally');
  const [members, setMembers] = useState([]);
  const [payers, setPayers] = useState([]);
  const [splitValues, setSplitValues] = useState({});
  const [checkedMembers, setCheckedMembers] = useState({});
  const [showWhoPaid, setShowWhoPaid] = useState(false);
  const [showSplitType, setShowSplitType] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/group-memberships/group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const memberList = res.data.map((m) => m.userId);
      setMembers(memberList);
      const initialChecked = {};
      memberList.forEach((m) => (initialChecked[m._id] = true));
      setCheckedMembers(initialChecked);
    };
    fetchMembers();
  }, [groupId]);

  useEffect(() => {
    if (splitType === 'equally' && amount && members.length) {
      const selected = members.filter((m) => checkedMembers[m._id]);
      const value = (parseFloat(amount) / selected.length || 0).toFixed(2);
      const newSplit = {};
      selected.forEach((m) => (newSplit[m._id] = value));
      setSplitValues(newSplit);
    }
  }, [splitType, amount, members, checkedMembers]);

  const handlePayerSelect = (userId) => {
    setPayers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSplitValueChange = (userId, value) => {
    setSplitValues({ ...splitValues, [userId]: value });
  };

  const handleCheckboxToggle = (userId) => {
    setCheckedMembers({ ...checkedMembers, [userId]: !checkedMembers[userId] });
  };

  const validateSplit = () => {
    if (splitType === 'unequally') {
      const sum = Object.values(splitValues).reduce(
        (acc, v) => acc + parseFloat(v || 0),
        0
      );
      return Math.abs(sum - parseFloat(amount)) < 0.01;
    } else if (splitType === 'percent') {
      const sum = Object.values(splitValues).reduce(
        (acc, v) => acc + parseFloat(v || 0),
        0
      );
      return Math.abs(sum - 100) < 0.01;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!validateSplit()) {
      alert(
        splitType === 'percent'
          ? 'Percentage must total 100%'
          : 'Amount must sum to total'
      );
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    const paidBy = payers.length
      ? payers.map((id) => ({
          userId: id,
          amount: (parseFloat(amount) / payers.length).toFixed(2),
        }))
      : [{ userId: members[0]._id, amount: amount }];

    const selectedMembers = members
      .filter((m) =>
        splitType === 'equally' ? checkedMembers[m._id] : true
      )
      .map((m) => m._id);

    const splitMember =
      splitType === 'percent'
        ? selectedMembers.map((id) => ({
            userId: id,
            amount: ((parseFloat(splitValues[id]) / 100) * amount).toFixed(2),
          }))
        : selectedMembers.map((id) => ({
            userId: id,
            amount: parseFloat(splitValues[id]).toFixed(2),
          }));

    const data = {
      groupId,
      description,
      amount: parseFloat(amount),
      paidBy,
      splitMember,
      splitType,
      date: new Date(),
    };

    await axios.post('/expenses', data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const transactions = [];
    paidBy.forEach(p => {
      transactions.push([p.userId, parseFloat(p.amount)]);
    });
    splitMember.forEach(s => {
      transactions.push([s.userId, -parseFloat(s.amount)]);
    });

    await axios.post(`/settlements/${groupId}`, { transactions }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setLoading(false);
    navigate(`/groups/${groupId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(`/groups/${groupId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Expense</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Expense Details */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Expense Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      placeholder="What was this expense for?"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Who Paid */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <button
                  type="button"
                  onClick={() => setShowWhoPaid(!showWhoPaid)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h2 className="text-xl font-semibold text-gray-900">Who Paid?</h2>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${showWhoPaid ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showWhoPaid && (
                  <div className="mt-4 space-y-2">
                    {members.map((m) => (
                      <label key={m._id} className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={payers.includes(m._id)}
                          onChange={() => handlePayerSelect(m._id)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <div className="ml-3 flex items-center">
                          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{m.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Split Type */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <button
                  type="button"
                  onClick={() => setShowSplitType(!showSplitType)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h2 className="text-xl font-semibold text-gray-900">
                    Split Type: <span className="text-emerald-600 capitalize">{splitType}</span>
                  </h2>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${showSplitType ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showSplitType && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { type: 'equally', label: 'Equally' },
                      { type: 'unequally', label: 'Unequally' },
                      { type: 'percent', label: 'Percentage' }
                    ].map(({ type, label }) => (
                      <button
                        key={type}
                        type="button"
                        className={`p-3 rounded-xl border-2 font-medium transition-all ${
                          splitType === type
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setSplitType(type)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Adding Expense...</span>
                  </>
                ) : (
                  <span>Add Expense</span>
                )}
              </button>
            </form>
          </div>

          {/* Split Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Split Details</h3>
              
              <div className="space-y-3">
                {members.map((m) =>
                  splitType === 'equally' ? (
                    <div key={m._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checkedMembers[m._id]}
                          onChange={() => handleCheckboxToggle(m._id)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <div className="ml-3 flex items-center">
                          <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-2">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-sm text-gray-900">{m.name}</span>
                        </div>
                      </label>
                      <span className="text-emerald-600 font-semibold text-sm">₹{splitValues[m._id] || '0.00'}</span>
                    </div>
                  ) : (
                    <div key={m._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-2">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm text-gray-900">{m.name}</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="number"
                          step="0.01"
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:border-emerald-500 focus:outline-none"
                          placeholder={splitType === 'percent' ? '0' : '0.00'}
                          value={splitValues[m._id] || ''}
                          onChange={(e) => handleSplitValueChange(m._id, e.target.value)}
                        />
                        <span className="text-gray-500 ml-1 text-sm">
                          {splitType === 'percent' ? '%' : '₹'}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}