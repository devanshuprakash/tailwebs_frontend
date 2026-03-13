import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const StudentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [answer, setAnswer] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all'); // all, missing, submitted
  const [search, setSearch] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAssignments();
  }, [filter, page, search]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/assignments/published?page=${page}&limit=10&filter=${filter}${search ? `&search=${search}` : ''}`);
      setAssignments(res.data.assignments);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error('Failed to fetch assignments', err);
      toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmit = (assignment) => {
    setSelectedAssignment(assignment);
    setAnswer('');
    setFile(null);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim() && !file) {
      toast.error('Please provide an answer or upload a file.');
      return;
    }
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (answer.trim()) formData.append('answer', answer);
      if (file) formData.append('file', file);

      await api.post(`/assignments/${selectedAssignment.id}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Assignment submitted successfully');
      setAnswer('');
      setFile(null);
      setSelectedAssignment(null);
      fetchAssignments(); // Refresh to get updated submission status
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Student Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          View your published assignments and submit answers before the deadline.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Available Assignments
          </h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto mt-4 sm:mt-0">
            <input 
              type="text" 
              placeholder="Search assignments..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500 w-full sm:w-48"
            />
            <div className="flex space-x-2">
              {['all', 'missing', 'submitted'].map(status => (
                <button
                  key={status}
                  onClick={() => { setFilter(status); setPage(1); }}
                  className={`px-3 py-1 text-sm rounded-md capitalize transition-colors ${
                    filter === status 
                      ? 'bg-primary-100 text-primary-800 font-medium' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="p-10 flex justify-center items-center">
            <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No published assignments yet. Check back later!</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {assignments.map(assignment => {
              const hasSubmitted = !!assignment.my_submission;
              const isPastDue = new Date(assignment.due_date) < new Date();
              
              return (
                <li key={assignment.id} className="p-6 transition-colors hover:bg-gray-50">
                  <div className="md:flex md:items-start md:justify-between">
                    <div className="flex-1 min-w-0 mb-4 md:mb-0">
                      <h4 className="text-lg font-medium text-primary-600">
                        {assignment.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 whitespace-pre-wrap">{assignment.description}</p>
                      <div className="mt-3 flex items-center text-sm text-gray-500 space-x-6">
                        <span className="flex items-center">
                          <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Prof. {assignment.teacher_name}
                        </span>
                        <span className={`flex items-center ${isPastDue && !hasSubmitted ? 'text-red-500 font-medium' : ''}`}>
                          <svg className={`flex-shrink-0 mr-1.5 h-4 w-4 ${isPastDue && !hasSubmitted ? 'text-red-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Due: {new Date(assignment.due_date).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                      {hasSubmitted ? (
                        <>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <svg className="-ml-1 mr-1.5 h-4 w-4 text-emerald-600" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>
                            Submitted
                          </span>
                          <span className="mt-1 text-xs text-gray-500">
                            on {new Date(assignment.my_submission.submitted_at).toLocaleDateString()}
                          </span>
                        </>
                      ) : isPastDue ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                          Missed Deadline
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenSubmit(assignment)}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                        >
                          Submit Answer
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Inline view of own submission */}
                  {hasSubmitted && (
                    <div className="mt-4 p-4 bg-emerald-50 rounded-md border border-emerald-100">
                      <h5 className="text-sm font-medium text-emerald-800 mb-2">Submitted Answer:</h5>
                      {assignment.my_submission.answer && (
                        <div className="text-sm text-emerald-900 font-serif whitespace-pre-wrap mb-2">
                          {assignment.my_submission.answer}
                        </div>
                      )}
                      {assignment.my_submission.fileUrl && (
                        <a 
                          href={`http://localhost:5001${assignment.my_submission.fileUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-900 underline"
                        >
                          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          {assignment.my_submission.fileName}
                        </a>
                      )}
                      
                      {/* Teacher Feedback Section */}
                      {assignment.my_submission.reviewed && (assignment.my_submission.grade || assignment.my_submission.feedback) && (
                        <div className="mt-4 pt-4 border-t border-emerald-200">
                          <h6 className="text-sm font-medium text-emerald-800 mb-1">Teacher Feedback:</h6>
                          {assignment.my_submission.grade !== null && (
                            <div className="text-sm text-emerald-900 mb-1">
                              <span className="font-semibold">Grade:</span> {assignment.my_submission.grade}
                            </div>
                          )}
                          {assignment.my_submission.feedback && (
                            <div className="text-sm text-emerald-900 italic">
                              "{assignment.my_submission.feedback}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        
        {/* Pagination */ }
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                     onClick={() => setPage(p => Math.max(1, p - 1))}
                     disabled={page === 1}
                     className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                     onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                     disabled={page === totalPages}
                     className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submission Modal */ }
      {selectedAssignment && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedAssignment(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Submit Answer: {selectedAssignment.title}
                  </h3>
                  <div className="mt-2 text-sm text-gray-500 mb-4 whitespace-pre-wrap">
                    {selectedAssignment.description}
                  </div>
                  <form onSubmit={handleSubmitAnswer}>
                    <div>
                      <label htmlFor="answer" className="sr-only">Your Answer</label>
                      <textarea
                        id="answer"
                        name="answer"
                        rows={8}
                        required
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md border p-3 font-serif"
                        placeholder="Type your answer here..."
                        autoFocus
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">Upload File (Optional)</label>
                      <input
                        type="file"
                        id="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        accept=".pdf,.doc,.docx,.zip"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                    </div>
                    <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        disabled={submitting || (!answer.trim() && !file)}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                      >
                        {submitting ? 'Submitting...' : 'Submit Final Answer'}
                      </button>
                      <button
                         type="button"
                         onClick={() => setSelectedAssignment(null)}
                         className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-red-500 text-center sm:text-right">
                      * You cannot edit your answer once submitted.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
