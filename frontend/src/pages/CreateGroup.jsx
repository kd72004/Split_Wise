import { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import getUserId from '../utils/getUserId';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CreateGroup() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupType, setGroupType] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📂');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const groupTypes = [
    { value: 'friends', label: 'Friends', icon: '👫', color: 'from-blue-500 to-blue-600' },
    { value: 'family', label: 'Family', icon: '🏠', color: 'from-green-500 to-green-600' },
    { value: 'trip', label: 'Trip/Travel', icon: '✈️', color: 'from-purple-500 to-purple-600' },
    { value: 'project', label: 'Project', icon: '📚', color: 'from-orange-500 to-orange-600' },
    { value: 'roommates', label: 'Roommates', icon: '🏡', color: 'from-pink-500 to-pink-600' },
    { value: 'other', label: 'Other', icon: '📂', color: 'from-gray-500 to-gray-600' }
  ];

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const userId = getUserId();
      const token = localStorage.getItem('token');
      const res = await axios.post('/groups/', {
        name,
        description,
        userId,
        type: groupType
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
      alert('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = (type) => {
    setGroupType(type.value);
    setSelectedIcon(type.icon);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-900">
      <Header />
      <div className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{selectedIcon}</div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-2">
              Create New Group
            </h1>
            <p className="text-gray-400">Start splitting expenses with your friends and family</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-2xl">
            {/* Group Name */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-semibold mb-2">Group Name *</label>
              <input
                type="text"
                placeholder="e.g., Weekend Trip, Roommate Expenses"
                className="w-full p-4 rounded-xl bg-gray-800/70 border border-gray-600 text-white focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            {/* Group Type Selection */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-semibold mb-3">Group Type *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {groupTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      groupType === type.value
                        ? `bg-gradient-to-r ${type.color} border-white/50 text-white`
                        : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-semibold mb-2">Description (Optional)</label>
              <textarea
                placeholder="Add a description for your group..."
                rows="3"
                className="w-full p-4 rounded-xl bg-gray-800/70 border border-gray-600 text-white focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition resize-none"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={!name || !groupType || loading}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Group...
                </>
              ) : (
                <>
                  <span className="text-xl">🚀</span>
                  Create Group
                </>
              )}
            </button>
          </form>

          {/* Tips */}
          <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
              <span>💡</span> Pro Tips
            </h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Choose a clear, descriptive name for your group</li>
              <li>• Select the right type to get relevant features</li>
              <li>• You can add members and start tracking expenses right after creation</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}