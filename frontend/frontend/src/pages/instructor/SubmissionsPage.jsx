import React, { useState } from 'react';
import { Download } from 'lucide-react';

const SubmissionsPage = () => {
  const [filterStatus, setFilterStatus] = useState('all');

  const submissions = [
    { id: 1, student: 'Alice Johnson', task: 'React Portfolio Project', submittedAt: '2025-01-20 14:30', status: 'pending', grade: null },
    { id: 2, student: 'Bob Smith', task: 'JavaScript Quiz', submittedAt: '2025-01-20 10:15', status: 'graded', grade: 'A' },
    { id: 3, student: 'Carol Wilson', task: 'CSS Layout Challenge', submittedAt: '2025-01-19 16:45', status: 'reviewed', grade: null },
    { id: 4, student: 'David Brown', task: 'React Portfolio Project', submittedAt: '2025-01-19 09:20', status: 'graded', grade: 'B+' },
    { id: 5, student: 'Emma Davis', task: 'JavaScript Quiz', submittedAt: '2025-01-18 13:10', status: 'pending', grade: null },
    { id: 6, student: 'Frank Miller', task: 'CSS Layout Challenge', submittedAt: '2025-01-18 11:30', status: 'graded', grade: 'A-' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'reviewed': return 'text-blue-600 bg-blue-100';
      case 'graded': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredSubmissions = submissions.filter(submission => 
    filterStatus === 'all' || submission.status === filterStatus
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
          <p className="text-gray-600">Review and grade student submissions</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Submissions</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="graded">Graded</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-indigo-600 text-sm font-medium">
                          {submission.student.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{submission.student}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{submission.task}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{submission.submittedAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.grade || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Review</button>
                    <button className="text-green-600 hover:text-green-900">Grade</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubmissionsPage;