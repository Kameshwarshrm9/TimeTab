import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ViewAssignedSubjects = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [assignedSubjects, setAssignedSubjects] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        setTeachers(data);
      })
      .catch((err) => console.error('Error fetching teachers:', err));
  }, []);

  const handleViewSubjects = () => {
    if (!selectedTeacher) {
      toast.error('Please select a teacher.');
      return;
    }

    fetch(`http://localhost:5000/api/teacher-subjects/${selectedTeacher}`)
      .then((res) => res.json())
      .then((data) => {
        setAssignedSubjects(data);
        if (data.length === 0) {
          toast.info('No subjects assigned to this teacher.');
        }
      })
      .catch((err) => {
        console.error('Error fetching assigned subjects:', err);
        toast.error('Failed to fetch assigned subjects.');
      });
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">View Assigned Subjects</h2>

      <div className="space-y-4">
        <label htmlFor="teacher" className="block text-xl text-gray-600">Select Teacher</label>
        <select
          id="teacher"
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="block w-full p-3 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <button
          onClick={handleViewSubjects}
          className="w-full py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          View Assigned Subjects
        </button>
      </div>

      {assignedSubjects.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Subjects:</h3>
          <ul className="list-disc pl-6 space-y-2">
            {assignedSubjects.map((item) => (
              <li key={item.id} className="text-lg text-gray-700">
                {item.subject?.name || 'Unknown Subject'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ViewAssignedSubjects;
