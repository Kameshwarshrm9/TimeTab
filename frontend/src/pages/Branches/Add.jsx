import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUniversity, FaPlus, FaUpload } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const AddBranch = () => {
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !semester) {
      toast.error('Both fields are required', {
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
      await axios.post('http://localhost:5000/api/branches', { name, semester });
      toast.success('Branch added successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setName('');
      setSemester('');
      navigate('/branches'); // Navigate to the branches list page
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add branch', {
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

          // Map Excel columns to branch fields (case-insensitive)
          const branches = jsonData.map((row) => ({
            name: row.Name || row.name,
            semester: row.Semester || row.semester,
          }));

          // Send to backend
          const response = await axios.post('http://localhost:5000/api/branches/bulk', branches);
          toast.success(response.data.message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          navigate('/branches'); // Navigate to the branches list page
        } catch (err) {
          console.error(err);
          toast.error(err.response?.data?.error || 'Failed to upload branches', {
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
      toast.error(err.response?.data?.error || 'Failed to upload branches', {
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
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md mt-8 border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-3 rounded-lg mr-4">
          <FaUniversity className="text-blue-600 text-xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Create New Branch</h2>
          <p className="text-sm text-gray-500">Add academic branch details</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Branch Name</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Computer Science"
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Semester</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="8"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="5"
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex items-center justify-center py-2.5 px-4 mt-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <FaPlus className="mr-2" />
          {isSubmitting ? 'Creating Branch...' : 'Create Branch'}
        </button>
      </form>

      {/* Excel File Upload */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload Branches via Excel
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
          Excel file should have columns: Name, Semester
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AddBranch;