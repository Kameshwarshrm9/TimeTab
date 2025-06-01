import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaSearch, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTeacherId, setEditingTeacherId] = useState(null); // Track which teacher is being edited
  const [editForm, setEditForm] = useState({ name: '', email: '', department: '' }); // Form state for editing

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/teachers');
        setTeachers(response.data);
        setFilteredTeachers(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch teachers');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    const filtered = teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (teacher.email && teacher.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (teacher.department && teacher.department.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredTeachers(filtered);
  }, [searchQuery, teachers]);

  const handleEditClick = (teacher) => {
    setEditingTeacherId(teacher.id);
    setEditForm({
      name: teacher.name,
      email: teacher.email || '',
      department: teacher.department || '',
    });
  };

  const handleEditCancel = () => {
    setEditingTeacherId(null);
    setEditForm({ name: '', email: '', department: '' });
  };

  const handleEditSubmit = async (id) => {
    try {
      const updatedTeacher = await axios.put(`http://localhost:5000/api/teachers/${id}`, {
        name: editForm.name,
        email: editForm.email || null, // Send null if empty
        department: editForm.department || null, // Send null if empty
      });
      setTeachers((prev) =>
        prev.map((teacher) =>
          teacher.id === id ? updatedTeacher.data : teacher
        )
      );
      setEditingTeacherId(null);
      setEditForm({ name: '', email: '', department: '' });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to update teacher');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/teachers/${id}`);
      setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to delete teacher');
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Teachers List</h2>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search teachers..."
            className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {filteredTeachers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No teachers match your search' : 'No teachers found'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  {editingTeacherId === teacher.id ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          required
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Name"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Email"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={editForm.department}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Department"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditSubmit(teacher.id)}
                          className="text-green-600 hover:text-green-800 mr-3"
                        >
                          <FaSave />
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <FaTimes />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {teacher.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        <div className="flex items-center">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          {teacher.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {teacher.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(teacher)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TeachersList;