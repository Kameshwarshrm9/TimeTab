import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AssignTeacherToBranchSubject = () => {
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesRes, subjectsRes, teachersRes] = await Promise.all([
          fetch('http://localhost:5000/api/branches'),
          fetch('http://localhost:5000/api/subjects/getsub'),
          fetch('http://localhost:5000/api/teachers'),
        ]);

        const branchesData = await branchesRes.json();
        const subjectsData = await subjectsRes.json();
        const teachersData = await teachersRes.json();

        setBranches(branchesData);
        setSubjects(subjectsData);
        setTeachers(teachersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!branchId || !subjectId || !teacherId) {
      toast.error('Please select all fields');
      return;
    }

    // Convert to integers before sending to backend
    if (
      isNaN(parseInt(branchId)) ||
      isNaN(parseInt(subjectId)) ||
      isNaN(parseInt(teacherId))
    ) {
      toast.error('Invalid selection.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('http://localhost:5000/api/branch-subject-teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branchId: parseInt(branchId),
          subjectId: parseInt(subjectId),
          teacherId: parseInt(teacherId),
        }),
      });

      if (res.ok) {
        toast.success('Teacher successfully assigned!');
        setBranchId('');
        setSubjectId('');
        setTeacherId('');
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Assignment failed');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Server error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-10">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Assign Teacher to Branch-Subject</h2>
      {loading ? (
        <div className="text-center text-gray-500">Loading data...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Select Branch</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Select Branch --</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} - Sem {branch.semester}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Select Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
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
            <label className="block mb-2 text-sm font-semibold text-gray-700">Select Teacher</label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2 text-white font-semibold rounded-lg transition-colors ${
              submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitting ? 'Assigning...' : 'Assign Teacher'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AssignTeacherToBranchSubject;