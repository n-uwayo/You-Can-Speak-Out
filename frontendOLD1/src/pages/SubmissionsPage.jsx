import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  Calendar, 
  Award,
  RefreshCw,
  Loader,
  AlertTriangle,
  MessageSquare,
  Save,
  Edit,
  Settings
} from 'lucide-react';

const SubmissionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    graded: 0,
    late: 0,
    averageGrade: 0
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [editData, setEditData] = useState({
    status: '',
    grade: '',
    feedback: '',
    reason: ''
  });

  // PHP API base URL
  const API_BASE_URL = 'https://ycspout.umwalimu.com/api/student';

  // Available status options
  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'yellow' },
    { value: 'reviewed', label: 'Reviewed', icon: Eye, color: 'blue' },
    { value: 'graded', label: 'Graded', icon: CheckCircle, color: 'green' },
    { value: 'late', label: 'Late', icon: XCircle, color: 'red' },
    { value: 'resubmit', label: 'Needs Resubmission', icon: RefreshCw, color: 'orange' },
    { value: 'incomplete', label: 'Incomplete', icon: AlertTriangle, color: 'gray' }
  ];

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${API_BASE_URL}/submissions.php`;
      
      // Add status filter if not 'all'
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch submissions: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSubmissions(data.data.submissions || []);
        setStats(data.data.stats || {
          total: 0,
          pending: 0,
          reviewed: 0,
          graded: 0,
          late: 0,
          averageGrade: 0
        });
      } else {
        throw new Error(data.message || 'Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert(error.message || 'Failed to load submissions. Please try again.');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmission = (submission) => {
    setSelectedSubmission(submission);
    setEditData({
      status: submission.status || 'pending',
      grade: submission.grade || '',
      feedback: submission.feedback || '',
      reason: ''
    });
    setShowEditModal(true);
  };

  const submitEdit = async () => {
    // Validate grade if provided
    if (editData.grade && (editData.grade < 0 || editData.grade > 100)) {
      alert('Please enter a valid grade between 0 and 100');
      return;
    }

    // If status is graded, require a grade
    if (editData.status === 'graded' && !editData.grade) {
      alert('A grade is required when marking as graded');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        status: editData.status,
        statusReason: editData.reason
      };

      // Include grade and feedback if provided
      if (editData.grade) {
        updateData.grade = parseInt(editData.grade);
      }
      if (editData.feedback) {
        updateData.feedback = editData.feedback;
      }

      const response = await fetch(`${API_BASE_URL}/sub_edit.php?id=${selectedSubmission.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update submission: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert('Submission updated successfully!');
        setShowEditModal(false);
        fetchSubmissions(); // Refresh data
      } else {
        throw new Error(result.message || 'Failed to update submission');
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      alert(error.message || 'Failed to update submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadSubmission = async (submission) => {
    if (!submission.filePath) {
      alert('No file attached to this submission');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      window.location.href = `${API_BASE_URL}/submissions.php?id=${submission.id}&action=download&token=${token}`;
    } catch (error) {
      console.error('Error downloading submission:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleViewSubmission = (submission) => {
    // Open a modal or navigate to detailed view
    alert(`Viewing submission:\n\nStudent: ${submission.student}\nTask: ${submission.task}\n\nSubmission Text:\n${submission.submissionText || 'No text submitted'}`);
  };

  const handleRefresh = () => {
    fetchSubmissions();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      case 'resubmit':
        return 'bg-orange-100 text-orange-800';
      case 'incomplete':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'reviewed':
        return <Eye className="w-4 h-4" />;
      case 'graded':
        return <CheckCircle className="w-4 h-4" />;
      case 'late':
        return <XCircle className="w-4 h-4" />;
      case 'resubmit':
        return <RefreshCw className="w-4 h-4" />;
      case 'incomplete':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.student?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.task?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.course?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || submission.type?.toLowerCase() === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading submissions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
        <p className="text-gray-600 mt-2">Review and grade student submissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Graded</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.graded}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Grade</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{Math.round(stats.averageGrade)}%</p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="graded">Graded</option>
              <option value="late">Late</option>
              <option value="resubmit">Needs Resubmission</option>
              <option value="incomplete">Incomplete</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="assignment">Assignment</option>
              <option value="project">Project</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student & Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No submissions found</p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">{submission.student}</div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{submission.task}</div>
                        {submission.fileName && (
                          <div className="text-xs text-gray-400 mt-1">
                            {submission.fileName} ({submission.fileSize})
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.course}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {submission.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                        {submission.submittedAt}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Due: {submission.dueDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1 capitalize">{submission.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.grade ? (
                        <span className="font-medium">{submission.grade}/100</span>
                      ) : (
                        <span className="text-gray-400">Not graded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {submission.fileName && (
                          <button
                            onClick={() => handleDownloadSubmission(submission)}
                            className="text-green-600 hover:text-green-900"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleViewSubmission(submission)}
                          className="text-blue-600 hover:text-blue-900" 
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditSubmission(submission)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Edit Submission"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {(submission.status === 'pending' || submission.status === 'late') && (
                          <button
                            onClick={() => handleEditSubmission(submission)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Grade & Edit"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {submission.feedback && (
                          <MessageSquare className="w-4 h-4 text-gray-400" title="Has feedback" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Submission Modal */}
      {showEditModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Submission</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Student: <span className="font-medium">{selectedSubmission.student}</span></p>
              <p className="text-sm text-gray-600">Task: <span className="font-medium">{selectedSubmission.task}</span></p>
              <p className="text-sm text-gray-600">Current Status: <span className="font-medium capitalize">{selectedSubmission.status}</span></p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade (out of 100)
                  {editData.status === 'graded' && <span className="text-red-500"> *</span>}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editData.grade}
                  onChange={(e) => setEditData({ ...editData, grade: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter grade (0-100)"
                />
                {editData.status === 'graded' && !editData.grade && (
                  <p className="text-red-500 text-xs mt-1">Grade is required when status is "Graded"</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  rows="4"
                  value={editData.feedback}
                  onChange={(e) => setEditData({ ...editData, feedback: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Provide feedback to the student..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Changes (Optional)
                </label>
                <textarea
                  rows="2"
                  value={editData.reason}
                  onChange={(e) => setEditData({ ...editData, reason: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Explain any changes being made..."
                />
              </div>

              {(editData.status !== selectedSubmission.status || 
                editData.grade !== (selectedSubmission.grade || '') || 
                editData.feedback !== (selectedSubmission.feedback || '')) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <Settings className="w-5 h-5 text-blue-500 mt-0.5 mr-2" />
                    <div className="text-sm text-blue-700">
                      <strong>Changes Preview:</strong>
                      {editData.status !== selectedSubmission.status && (
                        <div>Status: {selectedSubmission.status} → {editData.status}</div>
                      )}
                      {editData.grade !== (selectedSubmission.grade || '') && (
                        <div>Grade: {selectedSubmission.grade || 'None'} → {editData.grade || 'None'}</div>
                      )}
                      {editData.feedback !== (selectedSubmission.feedback || '') && (
                        <div>Feedback: {selectedSubmission.feedback ? 'Updated' : 'Added'}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                disabled={submitting || (editData.status === 'graded' && !editData.grade)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredSubmissions.length}</span> of{' '}
          <span className="font-medium">{submissions.length}</span> results
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionsPage; 