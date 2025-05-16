import React, { useState } from 'react';
import axios from 'axios';
import { FaExclamationTriangle } from 'react-icons/fa';

const ResetDatabase = () => {
  const [confirmation, setConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleReset = async () => {
    if (confirmation !== 'confirm') {
      setError('Please type "confirm" to proceed');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Trigger backup download
      const backupResponse = await axios.get('http://localhost:5000/api/backup', {
        responseType: 'blob',
      });

      // Create download link for backup
      const url = window.URL.createObjectURL(new Blob([backupResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Trigger reset
      const resetResponse = await axios.post('http://localhost:5000/api/reset', {
        confirmation: 'confirm',
      });

      setSuccess(resetResponse.data.message);
      setConfirmation('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to backup or reset database');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Backup & Reset Database</h2>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4 text-yellow-600">
          <FaExclamationTriangle className="mr-2" />
          <p className="font-medium">
            Warning: This action will download a backup of all data and then permanently delete all records from the database.
          </p>
        </div>
        <p className="text-gray-600 mb-4">
          To proceed, type <strong>"confirm"</strong> in the input below and click Reset. A backup Excel file will be downloaded before the database is reset.
        </p>
        <div className="mb-4">
          <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700">
            Confirmation
          </label>
          <input
            id="confirmation"
            type="text"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="Type 'confirm' to proceed"
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleReset}
          className={`w-full py-2 bg-red-600 text-white font-semibold rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Backup & Reset Database'}
        </button>
        {error && (
          <div className="mt-4 p-2 text-center text-red-500">{error}</div>
        )}
        {success && (
          <div className="mt-4 p-2 text-center text-green-500">{success}</div>
        )}
      </div>
    </div>
  );
};

export default ResetDatabase;