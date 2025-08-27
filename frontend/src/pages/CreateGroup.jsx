import { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import getUserId from '../utils/getUserId';
import { toast } from 'react-toastify';
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
    { value: 'friends', label: 'Friends', icon: '👫', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { value: 'family', label: 'Family', icon: '🏠', color: 'bg-green-50 border-green-200 text-green-700' },
    { value: 'trip', label: 'Trip/Travel', icon: '✈️', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { value: 'project', label: 'Project', icon: '📚', color: 'bg-orange-50 border-orange-200 text-orange-700' },
    { value: 'roommates', label: 'Roommates', icon: '🏡', color: 'bg-pink-50 border-pink-200 text-pink-700' },
    { value: 'other', label: 'Other', icon: '📂', color: 'bg-gray-50 border-gray-200 text-gray-700' }
  ];

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const userId = getUserId();
      const token = localStorage.getItem('token');
      
      console.log('Creating group with data:', { name, description, userId, type: groupType });
      console.log('Token:', token ? 'Present' : 'Missing');
      
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

      console.log('Group created:', res.data);
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
      
      console.log('Member added successfully');
      navigate(`/groups/${newGroupId}`);
    } catch (err) {
      console.error('Error creating group:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create group';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = (type) => {
    setGroupType(type.value);
    setSelectedIcon(type.icon);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{selectedIcon}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Group
          </h1>
          <p className="text-gray-600">Start splitting expenses with your friends and family</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group Name *</label>
              <input
                type="text"
                placeholder="e.g., Weekend Trip, Roommate Expenses"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            {/* Group Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Group Type *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {groupTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      groupType === type.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
              <textarea
                placeholder="Add a description for your group..."
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={!name || !groupType || loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold rounded-2xl transition-colors disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Group...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create Group</span>
                </>
              )}
            </button>
          </form>

          {/* Tips */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="text-blue-700 font-semibold mb-2 flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Pro Tips</span>
            </h3>
            <ul className="text-blue-600 text-sm space-y-1">
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