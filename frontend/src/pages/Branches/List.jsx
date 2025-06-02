import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';

const BranchesList = () => {
  const [branches, setBranches] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query
  const [isLoading, setIsLoading] = useState(true);

  const fetchBranches = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/branches');
      setBranches(res.data);
    } catch (err) {
      toast.error('Failed to fetch branches');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/branches/${id}`);
      setBranches((prev) => prev.filter((branch) => branch.id !== id));
      toast.success('Branch deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete branch');
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Filter branches based on search query
  const filteredBranches = branches.filter((branch) =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Branches List</h2>
        <div className="relative">
          <input
            type="text"
            className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Search branches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {filteredBranches.length === 0 ? (
        <p className="text-sm text-gray-500">No branches available</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{branch.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{branch.semester}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDelete(branch.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BranchesList;