import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GenerateTimetable = () => {
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');

  const handleGenerate = async () => {
    if (!branch || !semester) {
      toast.error('Please select branch and semester!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ branch, semester }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Timetable generated successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error(data.message || 'Error generating timetable', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error('Error generating timetable:', error);
      toast.error('Error generating timetable', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generate Timetable</h1>
      <div className="mb-4">
        <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Branch</label>
        <select
          id="branch"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        >
          <option value="">Select Branch</option>
          <option value="CSE">CSE</option>
          <option value="EE">EE</option>
          <option value="ECE">ECE</option>
          <option value="ME">ME</option>
          <option value="Civil">Civil</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
        <select
          id="semester"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="">Select Semester</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <option key={sem} value={sem}>{sem}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleGenerate}
        className="mt-4 w-full py-2 bg-blue-600 text-white font-semibold rounded-md"
      >
        Generate Timetable
      </button>

      <ToastContainer />
    </div>
  );
};

export default GenerateTimetable;