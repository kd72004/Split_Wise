import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import getUserId from '../utils/getUserId';
import { Link } from 'react-router-dom';

export default function UserGroups() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const userId = getUserId();
        const token = localStorage.getItem('token');
        const res = await axios.get(`/group-memberships/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGroups(Array.isArray(res.data) ? res.data : [res.data]);
      } catch (err) {
        console.error('Error fetching groups:', err);
      }
    };
    fetchGroups();
  }, []);

  const getGroupIcon = (groupName) => {
    const lower = groupName.toLowerCase();
    if (lower.includes('project')) return '📚';
    if (lower.includes('expense')) return '💰';
    if (lower.includes('friends')) return '👫';
    if (lower.includes('family')) return '🏠';
    if (lower.includes('trip')) return '✈️';
    if (lower.includes('health')) return '🏥';
    return '📂';
  };

  return (
    <div className="flex justify-center overflow-hidden">
      <div className="flex flex-col items-center gap-6 p-4 w-full max-w-md scrollbar-hide">
        {groups.map(group => (
          <Link
            key={group._id}
            to={`/groups/${group._id}`}
            className="bg-green-800 w-full p-8 rounded-2xl shadow-xl hover:bg-green-700 transition transform hover:scale-105"
          >
            <div className="text-5xl mb-3">{getGroupIcon(group.name)}</div>
            <h2 className="text-3xl font-bold text-white mb-3">{group.name}</h2>
            <p className="text-gray-200 text-lg">{group.description || 'No description'}</p>
          </Link>
        ))}
      </div>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
