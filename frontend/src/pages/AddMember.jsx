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
    return '3+';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
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
          <h1 className="text-3xl font-bold text-gray-900">Add Member</h1>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Users</h2>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by name or email..." 
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
          
          {/* Search Results */}
          {filteredUsers.length > 0 && (
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {filteredUsers.map(user => (
                <div 
                  key={user._id} 
                  onClick={() => handleAdd(user._id)} 
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                      {getDegreeLabel(userDegrees[user._id])} connection
                    </span>
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {adding && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center text-emerald-600">
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding member...
              </div>
            </div>
          )}
        </div>

        {/* Current Members */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Members ({members.length})</h2>
          <div className="space-y-3">
            {members.map(m => (
              <div key={m.userId._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{m.userId.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{m.userId.name}</p>
                    <p className="text-sm text-gray-500">{m.userId.email}</p>
                  </div>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  Member
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}