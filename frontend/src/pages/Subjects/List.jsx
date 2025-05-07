// pages/Subjects/List.jsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBook } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ListSubjects = () => {
  const [subjects, setSubjects] = useState([]);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/subjects/getsub');
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch subjects');
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <FaBook className="mr-2 text-blue-500" />
        All Subjects
      </h2>
      {subjects.length === 0 ? (
        <p className="text-gray-600">No subjects found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center hover:shadow-lg transition"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{subject.name}</h3>
                <p className="text-gray-500">{subject.code || 'No code provided'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListSubjects;
