import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBook, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ListSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', code: '', isLab: false });

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

  const handleEditClick = (subject) => {
    setEditingSubjectId(subject.id);
    setEditForm({
      name: subject.name,
      code: subject.code,
      isLab: subject.isLab,
    });
  };

  const handleEditCancel = () => {
    setEditingSubjectId(null);
    setEditForm({ name: '', code: '', isLab: false });
  };

  const handleEditSubmit = async (id) => {
    if (!editForm.name || !editForm.code) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const updatedSubject = await axios.put(`http://localhost:5000/api/subjects/${id}`, {
        name: editForm.name,
        code: editForm.code,
        isLab: editForm.isLab,
      });
      setSubjects((prev) =>
        prev.map((subject) =>
          subject.id === id ? updatedSubject.data : subject
        )
      );
      setEditingSubjectId(null);
      setEditForm({ name: '', code: '', isLab: false });
      toast.success('Subject updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update subject');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/subjects/${id}`);
      setSubjects((prev) => prev.filter((subject) => subject.id !== id));
      toast.success('Subject deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete subject');
    }
  };

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
              className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition"
            >
              {editingSubjectId === subject.id ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Subject Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="e.g. Mathematics"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Subject Code</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={editForm.code}
                      onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                      placeholder="e.g. MATH101"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`isLab-${subject.id}`}
                      checked={editForm.isLab}
                      onChange={(e) => setEditForm({ ...editForm, isLab: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`isLab-${subject.id}`} className="text-sm font-medium text-gray-700">
                      Lab Subject
                    </label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditSubmit(subject.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <FaSave size={20} />
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{subject.name}</h3>
                    <p className="text-gray-500">{subject.code || 'No code provided'}</p>
                    <p className="text-gray-500">
                      Type: {subject.isLab ? 'Lab' : 'Theory'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(subject)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListSubjects;