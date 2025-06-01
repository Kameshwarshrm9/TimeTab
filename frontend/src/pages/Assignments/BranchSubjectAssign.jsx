import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const BranchSubjectAssign = () => {
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [frequency, setFrequency] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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
      setSelectedBranch('');
      setSelectedSubject('');
      setFrequency('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign subject');
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
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel columns to assignment fields (case-insensitive)
        const assignments = jsonData.map((row) => ({
          branchName: row.branchName || row.BranchName,
          semester: row.semester || row.Semester,
          subjectName: row.subjectName || row.SubjectName,
          frequency: row.frequency || row.Frequency,
        }));

        // Send to backend
        const response = await axios.post('http://localhost:5000/api/branch-subjects/bulk', assignments);
        toast.success(response.data.message);
      };
      reader.onerror = () => {
        toast.error('Failed to read the Excel file');
        setIsUploading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload assignments');
    } finally {
      setIsUploading(false);
      e.target.value = null; // Reset file input
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

      {/* Excel File Upload */}
      <div className="mt-6">
        <label className="block text-gray-600 font-medium mb-1">
          Upload Branch-Subject Assignments via Excel
        </label>
        <div className="relative">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
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
          Excel file should have columns: branchName, semester, subjectName, frequency
        </p>
      </div>
    </div>
  );
};

export default BranchSubjectAssign;