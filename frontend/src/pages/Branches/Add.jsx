import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUniversity, FaPlus } from 'react-icons/fa';

const AddBranch = () => {
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !semester) {
      toast.error('Both fields are required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/branches', { name, semester });
      toast.success('Branch added successfully!');
      setName('');
      setSemester('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add branch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md mt-8 border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-3 rounded-lg mr-4">
          <FaUniversity className="text-blue-600 text-xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Create New Branch</h2>
          <p className="text-sm text-gray-500">Add academic branch details</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Branch Name</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Computer Science"
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Semester</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="8"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="5"
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex items-center justify-center py-2.5 px-4 mt-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <FaPlus className="mr-2" />
          {isSubmitting ? 'Creating Branch...' : 'Create Branch'}
        </button>
      </form>
    </div>
  );
};

export default AddBranch;