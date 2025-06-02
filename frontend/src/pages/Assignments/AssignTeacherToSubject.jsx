import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';

const AssignTeacherToSubject = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Fetch teachers
    fetch('http://localhost:5000/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        console.log('Teachers:', data);
        setTeachers(data);
      })
      .catch((err) => {
        console.error('Error fetching teachers:', err);
        toast.error('Failed to fetch teachers', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      });

    // Fetch subjects
    fetch('http://localhost:5000/api/subjects/getsub')
      .then((res) => res.json())
      .then((data) => {
        console.log('Subjects:', data);
        setSubjects(data);
      })
      .catch((err) => {
        console.error('Error fetching subjects:', err);
        toast.error('Failed to fetch subjects', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/teacher-subjects', {
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
        toast.success('Teacher assigned to subject successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setSelectedTeacher('');
        setSelectedSubject('');
      } else {
        toast.error(data.message || 'Error assigning teacher to subject', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      toast.error('An error occurred while assigning teacher.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Read and parse the Excel file
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const fileData = new Uint8Array(event.target.result);
          const workbook = XLSX.read(fileData, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Map Excel columns to assignment fields (case-insensitive)
          const assignments = jsonData.map((row) => ({
            teacherName: row.teacherName || row.TeacherName,
            subjectName: row.subjectName || row.SubjectName,
          }));

          // Send to backend
          const res = await fetch('http://localhost:5000/api/teacher-subjects/bulk', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(assignments),
          });

          const data = await res.json();

          if (res.ok) {
            toast.success(data.message, {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          } else {
            toast.error(data.error || 'Failed to upload assignments', {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
        } catch (err) {
          console.error(err);
          toast.error(err.message || 'Failed to upload assignments', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } finally {
          setIsUploading(false);
          e.target.value = null; // Reset file input
        }
      };
      reader.onerror = () => {
        toast.error('Failed to read the Excel file', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setIsUploading(false);
        e.target.value = null; // Reset file input
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while uploading the assignments.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setIsUploading(false);
      e.target.value = null; // Reset file input
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
            onChange={(e) => setSelectedSubject(e.target.value)} // Fixed bug: setSelectedTeacher was used instead of setSelectedSubject
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

      {/* Excel File Upload */}
      <div className="mt-6">
        <label className="block text-xl text-gray-600 mb-2">Upload Teacher-Subject Assignments via Excel</label>
        <div className="relative">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="block w-full p-3 border border-gray-300 rounded-md text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
          />
          {isUploading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Excel file should have columns: teacherName, subjectName
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AssignTeacherToSubject;