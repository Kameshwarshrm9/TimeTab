import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ViewBranchSemesterAssignments = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [semester, setSemester] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/branches');
        setBranches(response.data);
      } catch (err) {
        console.error('Failed to fetch branches', err);
      }
    };

    fetchBranches();
  }, []);

  const handleFetch = async () => {
    if (!selectedBranchId || !semester) {
      setError('Please select a branch and semester.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`http://localhost:5000/api/branch-subject-teachers/by-branch-semester`, {
        params: { branchId: selectedBranchId, semester }
      });
      setAssignments(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">View Branch & Semester Assignments</h2>

      <div className="mb-4">
        <label className="block mb-1">Select Branch:</label>
        <select
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
          className="border p-2 w-full rounded"
        >
          <option value="">-- Select Branch --</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1">Select Semester:</label>
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="border p-2 w-full rounded"
        >
          <option value="">-- Select Semester --</option>
          {[...Array(8)].map((_, idx) => (
            <option key={idx + 1} value={idx + 1}>
              Semester {idx + 1}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleFetch}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? 'Loading...' : 'Fetch Assignments'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="mt-6">
        {assignments.length > 0 ? (
          <div>
            <h3 className="text-xl font-semibold mb-3">Assignments:</h3>
            <ul className="space-y-3">
              {assignments.map((assignment) => (
                <li key={assignment.id} className="border p-3 rounded shadow">
                  <p><strong>Teacher:</strong> {assignment.teacher?.name || 'N/A'}</p>
                  <p><strong>Subject:</strong> {assignment.subject?.name || 'N/A'}</p>
                  <p><strong>Branch:</strong> {assignment.branch?.name || 'N/A'}</p>
                  <p><strong>Semester:</strong> {assignment.branch?.semester || 'N/A'}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          !loading && <p className="mt-4 text-gray-500">No assignments found.</p>
        )}
      </div>
    </div>
  );
};

export default ViewBranchSemesterAssignments;
