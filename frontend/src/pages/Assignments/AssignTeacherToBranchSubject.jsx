import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';

const AssignTeacherToBranchSubject = () => {
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesRes, subjectsRes, teachersRes] = await Promise.all([
          fetch('http://localhost:5000/api/branches'),
          fetch('http://localhost:5000/api/subjects/getsub'),
          fetch('http://localhost:5000/api/teachers'),
        ]);

        if (!branchesRes.ok) throw new Error('Failed to fetch branches');
        if (!subjectsRes.ok) throw new Error('Failed to fetch subjects');
        if (!teachersRes.ok) throw new Error('Failed to fetch teachers');

        const branchesData = await branchesRes.json();
        const subjectsData = await subjectsRes.json();
        const teachersData = await teachersRes.json();

        setBranches(branchesData);
        setSubjects(subjectsData);
        setTeachers(teachersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(error.message || 'Failed to fetch data', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!branchId || !subjectId || !teacherId) {
      toast.error('Please select all fields', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Convert to integers before sending to backend
    if (
      isNaN(parseInt(branchId)) ||
      isNaN(parseInt(subjectId)) ||
      isNaN(parseInt(teacherId))
    ) {
      toast.error('Invalid selection.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
        toast.success('Teacher successfully assigned!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setBranchId('');
        setSubjectId('');
        setTeacherId('');
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Assignment failed', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Server error', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setSubmitting(false);
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
          const assignments = jsonData.map((row, index) => {
            const branchName = row.branchName || row.BranchName;
            const semester = row.semester || row.Semester;
            const teacherName = row.teacherName || row.TeacherName;
            const subjectName = row.subjectName || row.SubjectName;

            if (!branchName || !semester || !teacherName || !subjectName) {
              throw new Error(`Assignment at index ${index} is missing required field: branchName, semester, teacherName, or subjectName`);
            }

            return {
              branchName,
              semester: Number(semester),
              teacherName,
              subjectName,
            };
          });

          // Map names to IDs
          const mappedAssignments = [];
          for (const assignment of assignments) {
            // Find branchId
            const branch = branches.find(
              (b) => b.name === assignment.branchName && b.semester === assignment.semester
            );
            if (!branch) {
              throw new Error(`Branch '${assignment.branchName}' (Semester ${assignment.semester}) not found at index ${assignments.indexOf(assignment)}`);
            }

            // Find subjectId
            const subject = subjects.find((s) => s.name === assignment.subjectName);
            if (!subject) {
              throw new Error(`Subject '${assignment.subjectName}' not found at index ${assignments.indexOf(assignment)}`);
            }

            // Find teacherId
            const teacher = teachers.find((t) => t.name === assignment.teacherName);
            if (!teacher) {
              throw new Error(`Teacher '${assignment.teacherName}' not found at index ${assignments.indexOf(assignment)}`);
            }

            mappedAssignments.push({
              branchId: branch.id,
              subjectId: subject.id,
              teacherId: teacher.id,
            });
          }

          // Send to backend
          const res = await fetch('http://localhost:5000/api/branch-subject-teachers/bulk', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(mappedAssignments),
          });

          const data = await res.json();

          if (res.ok) {
            toast.success(data.message || `Successfully created ${mappedAssignments.length} assignments`, {
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
      toast.error(err.message || 'An error occurred while uploading the assignments', {
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
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-10">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Assign Teacher to Branch-Subject</h2>
      {loading ? (
        <div className="text-center text-gray-500">Loading data...</div>
      ) : (
        <>
          {/* Manual Assignment Form */}
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

          {/* Excel File Upload */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Upload Assignments via Excel</h3>
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
              Excel file should have columns: branchName, semester, teacherName, subjectName
            </p>
          </div>
        </>
      )}
      <ToastContainer />
    </div>
  );
};

export default AssignTeacherToBranchSubject;