import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ViewBranchSemesterAssignments = () => {
  const [branches, setBranches] = useState([]);
  const [uniqueBranchNames, setUniqueBranchNames] = useState([]);
  const [selectedBranchName, setSelectedBranchName] = useState('');
  const [semester, setSemester] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState({}); // Track loading state for each delete button

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/branches');
        const branchesData = response.data;

        // Store all branches
        setBranches(branchesData);

        // Extract unique branch names
        const uniqueNames = [...new Set(branchesData.map((branch) => branch.name))];
        setUniqueBranchNames(uniqueNames);
      } catch (err) {
        console.error('Failed to fetch branches', err);
        toast.error('Failed to fetch branches');
      }
    };

    fetchBranches();
  }, []);

  const handleFetch = async () => {
    if (!selectedBranchName || !semester) {
      setError('Please select a branch and semester.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Find a branchId that matches the selected branch name and semester
      const selectedBranch = branches.find(
        (branch) =>
          branch.name === selectedBranchName && branch.semester === parseInt(semester)
      );

      if (!selectedBranch) {
        setError('No branch found for the selected name and semester.');
        setAssignments([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/branch-subject-teachers/by-branch-semester`, {
        params: { branchId: selectedBranch.id, semester }
      });
      setAssignments(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignment) => {
    // Show confirmation prompt
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the assignment for Teacher: ${assignment.teacher?.name}, Subject: ${assignment.subject?.name}, Branch: ${assignment.branch?.name} (Sem ${assignment.branch?.semester})?`
    );
    if (!confirmDelete) return;

    // Extract IDs for the DELETE request
    const { branchId, subjectId, teacherId } = assignment;

    // Set loading state for this specific assignment
    setDeleting((prev) => ({ ...prev, [assignment.id]: true }));

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/branch-subject-teachers/${branchId}/${subjectId}/${teacherId}`
      );

      if (response.status === 200) {
        // Remove the deleted assignment from the state
        setAssignments((prevAssignments) =>
          prevAssignments.filter((a) => a.id !== assignment.id)
        );
        toast.success('Assignment deleted successfully!');
      } else {
        throw new Error('Failed to delete assignment');
      }
    } catch (err) {
      console.error('Error deleting assignment:', err);
      toast.error(err.response?.data?.error || 'Failed to delete assignment');
    } finally {
      // Clear loading state for this assignment
      setDeleting((prev) => ({ ...prev, [assignment.id]: false }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">View Branch & Semester Assignments</h2>

      <div className="mb-4">
        <label className="block mb-1">Select Branch:</label>
        <select
          value={selectedBranchName}
          onChange={(e) => setSelectedBranchName(e.target.value)}
          className="border p-2 w-full rounded"
        >
          <option value="">-- Select Branch --</option>
          {uniqueBranchNames.map((branchName) => (
            <option key={branchName} value={branchName}>
              {branchName}
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
                <li key={assignment.id} className="border p-3 rounded shadow flex justify-between items-center">
                  <div>
                    <p><strong>Teacher:</strong> {assignment.teacher?.name || 'N/A'}</p>
                    <p><strong>Subject:</strong> {assignment.subject?.name || 'N/A'}</p>
                    <p><strong>Branch:</strong> {assignment.branch?.name || 'N/A'}</p>
                    <p><strong>Semester:</strong> {assignment.branch?.semester || 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(assignment)}
                    disabled={deleting[assignment.id]}
                    className={`ml-4 px-3 py-1 text-white font-semibold rounded-lg transition-colors ${
                      deleting[assignment.id]
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {deleting[assignment.id] ? 'Deleting...' : 'Delete'}
                  </button>
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