import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';

const BranchSubjectView = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [assignedSubjects, setAssignedSubjects] = useState([]);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/branches');
        setBranches(res.data);
      } catch (err) {
        toast.error('Failed to fetch branches');
      }
    };
    fetchBranches();
  }, []);

  // Fetch assigned subjects when branch changes
  useEffect(() => {
    if (selectedBranch) {
      const fetchAssignedSubjects = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/branch-subjects/${selectedBranch}`);
          setAssignedSubjects(res.data);
        } catch (err) {
          toast.error('Failed to fetch assigned subjects');
        }
      };
      fetchAssignedSubjects();
    } else {
      setAssignedSubjects([]);
    }
  }, [selectedBranch]);

  // Handle deletion of a branch-subject assignment
  const handleDelete = async (branchId, subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject assignment?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/branch-subjects/${branchId}/${subjectId}`);
      setAssignedSubjects((prev) => prev.filter((as) => as.subjectId !== subjectId));
      toast.success('Subject assignment deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete subject assignment');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">View Assigned Subjects</h2>

      <div>
        <label className="block text-gray-600 font-medium mb-2">Select Branch</label>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select Branch --</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name} (Semester {branch.semester})
            </option>
          ))}
        </select>
      </div>

      {assignedSubjects.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Assigned Subjects</h3>
          <ul className="space-y-2">
            {assignedSubjects.map((as) => (
              <li
                key={`${as.branchId}-${as.subjectId}`}
                className="flex justify-between items-center p-3 bg-gray-100 rounded-lg shadow-sm"
              >
                <span className="font-medium text-gray-700">{as.subject.name}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-500">Frequency: {as.frequency} / week</span>
                  <button
                    onClick={() => handleDelete(as.branchId, as.subjectId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : selectedBranch ? (
        <p className="mt-4 text-gray-500">No subjects assigned yet for this branch.</p>
      ) : null}
    </div>
  );
};

export default BranchSubjectView;