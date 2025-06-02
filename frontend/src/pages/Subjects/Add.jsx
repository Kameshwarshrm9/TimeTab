import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import { FaUpload } from 'react-icons/fa';

const AddSubject = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isLab, setIsLab] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !code) {
      toast.error('Please fill in all fields', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/subjects/create', {
        name,
        code,
        isLab,
      });
      toast.success('Subject added successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setName('');
      setCode('');
      setIsLab(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add subject', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
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
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Map Excel columns to subject fields (case-insensitive)
          const subjects = jsonData.map((row) => ({
            name: row.Name || row.name,
            code: row.Code || row.code,
            isLab: row.IsLab ?? row.isLab ?? false, // Handle both IsLab and isLab, default to false
          }));

          // Send to backend
          const response = await axios.post('http://localhost:5000/api/subjects/bulk', subjects);
          toast.success(response.data.message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } catch (err) {
          console.error(err);
          toast.error(err.response?.data?.error || 'Failed to upload subjects', {
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
      toast.error(err.response?.data?.error || 'Failed to upload subjects', {
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
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Add New Subject</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Subject Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mathematics"
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Subject Code</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. MATH101"
          />
        </div>
        
        <div className="flex items-center space-x-3 pt-2">
          <input
            type="checkbox"
            id="isLab"
            checked={isLab}
            onChange={(e) => setIsLab(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="isLab" className="text-sm font-medium text-gray-700">
            Lab Subject
          </label>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2.5 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Adding...' : 'Add Subject'}
        </button>
      </form>

      {/* Excel File Upload */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload Subjects via Excel
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
          Excel file should have columns: Name, Code, IsLab (true/false)
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AddSubject;