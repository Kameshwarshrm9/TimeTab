import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { FaUserPlus, FaCheckCircle, FaUpload } from 'react-icons/fa';
import { FiAlertCircle } from 'react-icons/fi';

const AddTeacher = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setIsSubmitting(true);

    try {
      await axios.post('http://localhost:5000/api/teachers', { name, email, department });
      setSuccess('Teacher added successfully!');
      setName('');
      setEmail('');
      setDepartment('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to add teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSuccess('');
    setError('');
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

        // Map Excel columns to teacher fields (case-insensitive)
        const teachers = jsonData.map((row) => ({
          name: row.Name || row.name,
          email: row.Email || row.email,
          department: row.Department || row.department,
        }));

        // Send to backend
        const response = await axios.post('http://localhost:5000/api/teachers/bulk', teachers);
        setSuccess(response.data.message);
      };
      reader.onerror = () => {
        setError('Failed to read the Excel file');
        setIsUploading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to upload teachers');
    } finally {
      setIsUploading(false);
      e.target.value = null; // Reset file input
    }
  };

  return (
    <div className="max-w-md mx-auto my-10">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center">
            <FaUserPlus className="mr-3" />
            Register New Teacher
          </h2>
          <p className="mt-1 opacity-90">Add a teacher manually or upload an Excel file</p>
        </div>

        <div className="p-6">
          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
              <div className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-2" />
                <span className="text-green-700">{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
              <div className="flex items-center">
                <FiAlertCircle className="text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Manual Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <div className="relative">
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="e.g., Computer Science"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Add Teacher'}
              </button>
            </div>
          </form>

          {/* Excel File Upload */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Teachers via Excel
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all"
              />
              {isUploading && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Excel file should have columns: Name, Email, Department
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTeacher;