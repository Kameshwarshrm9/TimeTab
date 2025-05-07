import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BranchSubjectAssign = () => {
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [frequency, setFrequency] = useState('');

  // Fetch branches + subjects
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/branches');
        setBranches(res.data);
      } catch (err) {
        toast.error('Failed to fetch branches');
      }
    };

    const fetchSubjects = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/subjects/getsub');
        setSubjects(res.data);
      } catch (err) {
        toast.error('Failed to fetch subjects');
      }
    };

    fetchBranches();
    fetchSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBranch || !selectedSubject || frequency === '') {
      toast.error('All fields are required');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/branch-subjects', {
        branchId: selectedBranch,
        subjectId: selectedSubject,
        frequency,
      });
      toast.success('Subject assigned successfully!');
      setSelectedSubject('');
      setFrequency('');
    } catch (err) {
      toast.error('Failed to assign subject');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">Assign Subject to Branch</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Select Branch</label>
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
        <div>
          <label className="block text-gray-600 font-medium mb-1">Select Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Frequency (per week)</label>
          <input
            type="number"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            placeholder="e.g., 3"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200"
        >
          Assign Subject
        </button>
      </form>
    </div>
  );
};

export default BranchSubjectAssign;
