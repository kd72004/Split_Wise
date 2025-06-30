import { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import getUserId from '../utils/getUserId';

// const navigate = useNavigate();

export default function CreateGroup() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupType, setGroupType] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const userId = getUserId();
      const token = localStorage.getItem('token');
      const res = await axios.post('/groups/', {
        name,
        description,
        userId,
        groupType
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const newGroupId = res.data._id;
      // Add creator as a group member
      await axios.post('/group-memberships', {
        userId,
        groupId: newGroupId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      navigate(`/groups/${newGroupId}`);
    } catch (err) {
      console.error('Error creating group:', err);
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-green-900 p-8 rounded-lg w-full max-w-lg shadow-xl">
        <h1 className="text-3xl font-bold text-green-300 mb-6 text-center">Create New Group</h1>
        <input
          type="text"
          placeholder="Group Name"
          className="w-full mb-4 p-3 rounded bg-gray-800 text-white"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          className="w-full mb-4 p-3 rounded bg-gray-800 text-white"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Group Type"
          className="w-full mb-4 p-3 rounded bg-gray-800 text-white"
          value={groupType}
          onChange={e => setGroupType(e.target.value)}
          required
        />
        <button type="submit" className="w-full py-3 bg-green-400 text-black font-bold rounded hover:bg-green-500 transition">
          Create Group
        </button>
      </form>
    </div>
  );
}