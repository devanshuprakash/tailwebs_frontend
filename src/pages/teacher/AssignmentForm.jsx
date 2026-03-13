import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const AssignmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await api.get(`/assignments/${id}`);
        const assignment = res.data;
        if (assignment) {
          setFormData({
            title: assignment.title,
            description: assignment.description,
            due_date: new Date(assignment.due_date).toISOString().slice(0, 16)
          });
        } else {
          setError('Assignment not found.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch assignment details.');
      }
    };

    if (isEdit) {
      fetchAssignment();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (actionStatus) => {
    setLoading(true);
    setError('');

    try {
      const payload = { ...formData, status: actionStatus };
      if (isEdit) {
        await api.put(`/assignments/${id}`, payload);
      } else {
        await api.post('/assignments', payload);
      }
      navigate('/teacher');
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          {isEdit ? 'Edit Assignment' : 'Create New Assignment'}
        </h2>
        <Link to="/teacher" className="text-sm font-medium text-gray-500 hover:text-gray-700">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100 p-6">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Assignment Title</label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2"
                placeholder="e.g. History Essay"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2"
                placeholder="Describe the task and expectations..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">Due Date & Time</label>
            <div className="mt-1">
              <input
                type="datetime-local"
                name="due_date"
                id="due_date"
                required
                value={formData.due_date}
                onChange={handleChange}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 pt-5 border-t border-gray-200">
            <Link
              to="/teacher"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors mr-3"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 mr-3"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentForm;
