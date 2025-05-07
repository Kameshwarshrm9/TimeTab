import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddSubject = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isLab, setIsLab] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !code) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/subjects/create', {
        name,
        code,
        isLab,
      });
      toast.success('Subject added successfully');
      setName('');
      setCode('');
      setIsLab(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Add New Subject</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Subject Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mathematics"
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Subject Code</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. MATH101"
          />
        </div>
        
        <div className="flex items-center space-x-3 pt-2">
          <input
            type="checkbox"
            id="isLab"
            checked={isLab}
            onChange={(e) => setIsLab(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="isLab" className="text-sm font-medium text-gray-700">
            Lab Subject
          </label>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2.5 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Adding...' : 'Add Subject'}
        </button>
      </form>
    </div>
  );
};

export default AddSubject;