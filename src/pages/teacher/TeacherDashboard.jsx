import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';

const TeacherDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDashboardData();
  }, [filter, page, search]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [assignmentsRes, statsRes] = await Promise.all([
        api.get(`/assignments?page=${page}&limit=10${filter ? `&status=${filter}` : ''}${search ? `&search=${search}` : ''}`),
        api.get('/assignments/dashboard/stats')
      ]);
      
      setAssignments(assignmentsRes.data.assignments);
      setTotalPages(assignmentsRes.data.pagination.totalPages);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/assignments/${id}/status`, { status: newStatus });
      toast.success(`Assignment marked as ${newStatus}`);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this draft assignment?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      toast.success('Assignment deleted');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete assignment');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Teacher Dashboard
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/teacher/assignments/new"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Create Assignment
          </Link>
        </div>
      </div>

      {stats && (
        <>
          <div className="mt-4 mb-8 grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 p-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Assignments</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalAssignments}</dd>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 p-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Submissions</dt>
              <dd className="mt-1 text-3xl font-semibold text-primary-600">{stats.totalSubmissions}</dd>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 p-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
              <dd className="mt-1 text-3xl font-semibold text-amber-500">{stats.pendingReview}</dd>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 p-5">
              <dt className="text-sm font-medium text-gray-500 truncate">Status Breakdown</dt>
              <dd className="mt-2 text-sm text-gray-600 flex justify-between">
                <span>Draft: <span className="font-medium text-gray-900">{stats.statusCounts.draft}</span></span>
                <span>Pub: <span className="font-medium text-emerald-600">{stats.statusCounts.published}</span></span>
                <span>Done: <span className="font-medium text-indigo-600">{stats.statusCounts.completed}</span></span>
              </dd>
            </div>
          </div>
          
          {stats.analytics && (
            <div className="mb-8 bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                 <h3 className="text-lg leading-6 font-medium text-gray-900">Advanced Analytics</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
                   <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                     <p className="text-sm text-indigo-700 font-medium">Global Submission Rate</p>
                     <p className="text-2xl font-bold text-indigo-900 mt-1">{stats.analytics.submissionRate}%</p>
                   </div>
                   <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                     <p className="text-sm text-red-700 font-medium">Late Submissions</p>
                     <p className="text-2xl font-bold text-red-900 mt-1">{stats.analytics.lateSubmissions}</p>
                   </div>
                </div>
                
                {stats.analytics.performanceTrends && stats.analytics.performanceTrends.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-4">Performance Trends (Top 5 Assignments)</h4>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.analytics.performanceTrends}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="title" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                          <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" />
                          <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '10px' }} />
                          <Bar yAxisId="left" dataKey="submissions" name="Total Submissions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                          <Bar yAxisId="right" dataKey="avgGrade" name="Average Grade" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 sm:mb-0">
            Assignments
          </h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Search assignments..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500 w-full sm:w-48"
            />
            <div className="flex space-x-2">
              {['', 'draft', 'published', 'completed'].map(status => (
                <button
                  key={status}
                  onClick={() => { setFilter(status); setPage(1); }}
                  className={`px-3 py-1 text-sm rounded-md capitalize transition-colors ${
                    filter === status 
                      ? 'bg-primary-100 text-primary-800 font-medium' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {status || 'All'}
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
          <div className="p-10 text-center text-gray-500">No assignments found.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {assignments.map(assignment => (
              <li key={assignment.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-medium text-primary-600 truncate">{assignment.title}</h4>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">{assignment.description}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                      <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                      <span className="flex items-center">
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {assignment.submission_count} Submissions
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                      assignment.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      assignment.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {assignment.status}
                    </span>
                    
                    <div className="flex space-x-2">
                      {assignment.status === 'draft' && (
                        <>
                          <Link to={`/teacher/assignments/${assignment.id}/edit`} className="text-primary-600 hover:text-primary-900 bg-primary-50 px-2 py-1 rounded text-sm">Edit</Link>
                          <button onClick={() => handleDelete(assignment.id)} className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded text-sm">Delete</button>
                          <button onClick={() => handleStatusChange(assignment.id, 'published')} className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded text-sm">Publish</button>
                        </>
                      )}
                      
                      {assignment.status === 'published' && (
                        <>
                          <Link to={`/teacher/assignments/${assignment.id}/submissions`} className="text-primary-600 hover:text-primary-900 bg-primary-50 px-2 py-1 rounded text-sm">View Submissions</Link>
                          <button onClick={() => handleStatusChange(assignment.id, 'completed')} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded text-sm">Mark Completed</button>
                        </>
                      )}
                      
                      {assignment.status === 'completed' && (
                        <Link to={`/teacher/assignments/${assignment.id}/submissions`} className="text-primary-600 hover:text-primary-900 bg-primary-50 px-2 py-1 rounded text-sm">View Submissions</Link>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        {/* Pagination Controls */}
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
    </div>
  );
};

export default TeacherDashboard;
