import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import getUserId from '../utils/getUserId';

export default function AddMember() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [adding, setAdding] = useState(false);
  const [userDegrees, setUserDegrees] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('/users/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllUsers(res.data);
    };
    fetchUsers();
  }, []);

  const fetchMembers = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`/group-memberships/group/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMembers(res.data);
  };
  useEffect(() => { fetchMembers(); }, [groupId]);

  useEffect(() => {
    if (search.length > 0) {
      const memberIds = new Set(members.map(m => m.userId._id));
      setFilteredUsers(
        allUsers.filter(u =>
          (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
          !memberIds.has(u._id)
        )
      );
    } else {
      setFilteredUsers([]);
    }
  }, [search, allUsers, members]);

  const handleAdd = async (userId) => {
    setAdding(true);
    const token = localStorage.getItem('token');
    await axios.post('/group-memberships', { userId, groupId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAdding(false);
    setSearch('');
    setFilteredUsers([]);
    fetchMembers();
  };

  useEffect(() => {
    const myUserId = getUserId();
    const token = localStorage.getItem('token');
    const fetchDegrees = async () => {
      const newDegrees = {};
      await Promise.all(filteredUsers.map(async (user) => {
        try {
          const res = await axios.get(`/users/degree/${myUserId}/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          newDegrees[user._id] = res.data.degree;
        } catch {
          newDegrees[user._id] = '-';
        }
      }));
      setUserDegrees(newDegrees);
    };
    if (filteredUsers.length > 0) fetchDegrees();
  }, [filteredUsers]);

  const getDegreeLabel = (degree) => {
    if (degree === 1) return '1st';
    if (degree === 2) return '2nd';
    if (degree === 3) return '3rd';
    if (degree >= 4) return '3+';
    return '-';
  };

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4 w-full overflow-hidden">
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate(`/groups/${groupId}`)} className="mb-4 bg-green-500 text-black font-bold px-4 py-2 rounded hover:bg-green-400 transition">← Back</button>
        <h1 className="text-2xl font-bold text-green-400 mb-4">Add Member</h1>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full px-3 py-2 mb-4 rounded bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
        <div className="space-y-2 mb-6 max-h-80 overflow-y-auto">
          {filteredUsers.map(user => (
            <div key={user._id} onClick={() => handleAdd(user._id)} className="flex justify-between items-center px-3 py-2 bg-gray-900 rounded hover:bg-gray-800 cursor-pointer">
              <div>
                <p className="text-base font-semibold text-green-300">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <div className="text-xs bg-green-600 px-2 py-1 rounded font-bold">{getDegreeLabel(userDegrees[user._id])}</div>
            </div>
          ))}
        </div>
        {adding && <p className="text-green-400">Adding...</p>}
        <h2 className="text-xl font-bold text-green-400 mt-6 mb-2">Members</h2>
        <ul className="space-y-2 max-h-80 overflow-y-auto">
          {members.map(m => (
            <li key={m.userId._id} className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded">
              <span className="text-base font-semibold text-green-300">{m.userId.name}</span>
              <span className="text-xs text-gray-400">{m.userId.email}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
