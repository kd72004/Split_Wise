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
  if (!validateSplit()) {
    alert(
      splitType === 'percent'
        ? 'Percentage must total 100%'
        : 'Amount must sum to total'
    );
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

  console.log('Expense Data:', data);

  await axios.post(
    '/expenses',
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
const transactions = [];

// Payers (positive amounts)
paidBy.forEach(p => {
  transactions.push([p.userId, parseFloat(p.amount)]);
});

// Split members (negative amounts)
splitMember.forEach(s => {
  transactions.push([s.userId, -parseFloat(s.amount)]);
});

// Call settlement API
await axios.post(
  `/settlements/${groupId}`,
  { transactions },
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);


  navigate(`/groups/${groupId}`);
};

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-green-400">Add Expense</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Expense description"
            className="w-full px-4 py-2 rounded bg-gray-800 text-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="₹ 0.00"
            className="w-full px-4 py-2 rounded bg-gray-800 text-white"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <button
            type="button"
            onClick={() => setShowWhoPaid(!showWhoPaid)}
            className="bg-green-500 text-black font-bold px-4 py-2 rounded"
          >
            Who Paid?
          </button>
          {showWhoPaid && (
            <div className="bg-gray-900 p-4 mt-2 rounded space-y-2">
              {members.map((m) => (
                <label key={m._id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={payers.includes(m._id)}
                    onChange={() => handlePayerSelect(m._id)}
                  />
                  <span className="ml-2">{m.name}</span>
                </label>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowSplitType(!showSplitType)}
            className="bg-green-500 text-black font-bold px-4 py-2 rounded"
          >
            Split Type: {splitType}
          </button>
          {showSplitType && (
            <div className="flex gap-2 mt-2">
              {['equally', 'unequally', 'percent'].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`px-3 py-1 rounded ${
                    splitType === type
                      ? 'bg-green-400 text-black'
                      : 'bg-gray-800 text-white'
                  }`}
                  onClick={() => setSplitType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-2">
            {members.map((m) =>
              splitType === 'equally' ? (
                <div key={m._id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={checkedMembers[m._id]}
                    onChange={() => handleCheckboxToggle(m._id)}
                  />
                  <span className="ml-2 w-32">{m.name}</span>
                  <span className="text-green-300">₹{splitValues[m._id]}</span>
                </div>
              ) : (
                <div key={m._id} className="flex items-center">
                  <span className="w-32">{m.name}</span>
                  <input
                    type="number"
                    className="ml-2 px-2 py-1 rounded bg-gray-800 text-white w-24"
                    placeholder={
                      splitType === 'percent' ? '% value' : '₹ value'
                    }
                    value={splitValues[m._id] || ''}
                    onChange={(e) =>
                      handleSplitValueChange(m._id, e.target.value)
                    }
                  />
                </div>
              )
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-500 text-black font-bold rounded hover:bg-green-400 transition"
          >
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
}
