import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const SubmissionsView = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackState, setFeedbackState] = useState({});

  useEffect(() => {
    fetchSubmissions();
  }, [id]);

  const fetchSubmissions = async () => {
    try {
      const res = await api.get(`/assignments/${id}/submissions`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load submissions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackChange = (submissionId, field, value) => {
    setFeedbackState(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value
      }
    }));
  };

  const handleMarkReviewed = async (submissionId) => {
    try {
      const feedbackData = feedbackState[submissionId] || {};
      await api.patch(`/assignments/submissions/${submissionId}/review`, feedbackData);
      fetchSubmissions();
      // Optionally show a toast notification here
    } catch (err) {
      alert('Failed to mark as reviewed');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading submissions...</div>;
  if (!data) return <div className="text-center py-20 text-red-500">Failed to load submissions.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link to="/teacher" className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center mb-4">
          &larr; Back to Dashboard
        </Link>
        <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{data.assignment.title}</h2>
              <p className="mt-1 text-gray-500">{data.assignment.description}</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                data.assignment.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {data.assignment.status}
              </span>
              <p className="mt-2 text-sm text-gray-500">
                Due: {new Date(data.assignment.due_date).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Student Submissions ({data.submissions.length})</h3>
        </div>
        
        {data.submissions.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No submissions yet.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {data.submissions.map(sub => (
              <li key={sub.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                         {sub.student_name.charAt(0)}
                       </div>
                       {sub.student_name}
                       <span className="text-sm font-normal text-gray-500">&lt;{sub.student_email}&gt;</span>
                    </h4>
                  </div>
                  <div className="text-sm flex flex-col items-end gap-1">
                    <span className="text-gray-500">Submitted: {new Date(sub.submitted_at).toLocaleString()}</span>
                    {sub.reviewed ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <svg className="mr-1 h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>
                        Reviewed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                         Pending Review
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded p-4 border border-gray-200">
                  {sub.answer && (
                    <div className="text-gray-800 whitespace-pre-wrap font-serif mb-2">
                      {sub.answer}
                    </div>
                  )}
                  {sub.fileUrl && (
                    <a 
                      href={`${API_BASE_URL}${sub.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      Download Attached File
                    </a>
                  )}
                </div>
                
                {!sub.reviewed && data.assignment.status !== 'completed' && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Provide Feedback (Optional)</h5>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor={`grade-${sub.id}`} className="block text-xs text-gray-500 mb-1">Grade / Marks</label>
                        <input 
                          type="number" 
                          id={`grade-${sub.id}`}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" 
                          placeholder="e.g. 95"
                          value={feedbackState[sub.id]?.grade || ''}
                          onChange={(e) => handleFeedbackChange(sub.id, 'grade', e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor={`feedback-${sub.id}`} className="block text-xs text-gray-500 mb-1">Comments</label>
                        <textarea 
                          id={`feedback-${sub.id}`}
                          rows="2" 
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" 
                          placeholder="Great work on..."
                          value={feedbackState[sub.id]?.feedback || ''}
                          onChange={(e) => handleFeedbackChange(sub.id, 'feedback', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleMarkReviewed(sub.id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                )}
                {sub.reviewed && (sub.feedback || sub.grade) && (
                  <div className="mt-4 p-4 bg-indigo-50 rounded border border-indigo-100">
                    <h5 className="text-sm font-medium text-indigo-800 mb-2">Teacher Feedback:</h5>
                    {sub.grade !== null && (
                      <div className="text-sm text-indigo-900 mb-1">
                        <span className="font-semibold">Grade:</span> {sub.grade}
                      </div>
                    )}
                    {sub.feedback && (
                      <div className="text-sm text-indigo-900 italic">
                        "{sub.feedback}"
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SubmissionsView;
