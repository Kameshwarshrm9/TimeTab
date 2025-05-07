import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AssignTeacherToSubject = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch teachers
    fetch('http://localhost:5000/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        console.log('Teachers:', data);
        setTeachers(data);
      })
      .catch((err) => console.error('Error fetching teachers:', err));

    // Fetch subjects
    fetch('http://localhost:5000/api/subjects/getsub')
      .then((res) => res.json())
      .then((data) => {
        console.log('Subjects:', data);
        setSubjects(data);
      })
      .catch((err) => console.error('Error fetching subjects:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/teacher-subjects', {  // ✅ Corrected URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: selectedTeacher,
          subjectId: selectedSubject,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Teacher assigned to subject successfully!');
      } else {
        toast.error(data.message || 'Error assigning teacher to subject');
      }
    } catch (err) {
      toast.error('An error occurred while assigning teacher.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">Assign Teacher to Subject</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="teacher" className="block text-xl text-gray-600">Select Teacher</label>
          <select
            id="teacher"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="block w-full p-3 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Teacher</option>
            {teachers.length === 0 ? (
              <option disabled>No teachers available</option>
            ) : (
              teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="subject" className="block text-xl text-gray-600">Select Subject</label>
          <select
            id="subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="block w-full p-3 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Subject</option>
            {subjects.length === 0 ? (
              <option disabled>No subjects available</option>
            ) : (
              subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Assigning...' : 'Assign Teacher'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignTeacherToSubject;
