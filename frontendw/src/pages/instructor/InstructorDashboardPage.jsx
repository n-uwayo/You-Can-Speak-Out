import React from 'react';
import { Video, FileText, Users, MessageSquare, Upload, Eye, CheckCircle, Clock } from 'lucide-react';

const InstructorDashboardPage = () => {
  const stats = [
    { title: 'My Videos', value: '24', change: '+3 this week', icon: Video, color: 'bg-blue-500' },
    { title: 'Active Tasks', value: '8', change: '+2 pending', icon: FileText, color: 'bg-green-500' },
    { title: 'My Students', value: '127', change: '+5 new', icon: Users, color: 'bg-purple-500' },
    { title: 'Feedback Given', value: '89', change: '+12 today', icon: MessageSquare, color: 'bg-orange-500' },
  ];

  const recentVideos = [
    { title: 'Introduction to React Hooks', views: 1240, duration: '15:30', status: 'Published' },
    { title: 'Advanced JavaScript Concepts', views: 892, duration: '22:15', status: 'Published' },
    { title: 'CSS Grid Layout', views: 654, duration: '18:45', status: 'Draft' },
    { title: 'Node.js Fundamentals', views: 0, duration: '25:10', status: 'Processing' },
  ];

  const pendingSubmissions = [
    { student: 'Alice Johnson', task: 'React Portfolio Project', submitted: '2 hours ago', status: 'pending' },
    { student: 'Bob Smith', task: 'JavaScript Quiz', submitted: '4 hours ago', status: 'pending' },
    { student: 'Carol Wilson', task: 'CSS Layout Challenge', submitted: '1 day ago', status: 'reviewed' },
    { student: 'David Brown', task: 'Node.js API Project', submitted: '2 days ago', status: 'graded' },
  ];

  const upcomingTasks = [
    { title: 'Final Project Submission', dueDate: 'Jan 25, 2025', students: 45 },
    { title: 'Mid-term Assessment', dueDate: 'Jan 30, 2025', students: 67 },
    { title: 'Code Review Assignment', dueDate: 'Feb 5, 2025', students: 34 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published': return 'text-green-600 bg-green-100';
      case 'Draft': return 'text-yellow-600 bg-yellow-100';
      case 'Processing': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'reviewed': return 'text-blue-600 bg-blue-100';
      case 'graded': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, John!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your courses today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Videos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Videos</h2>
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentVideos.map((video, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <Video className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{video.title}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {video.views} views
                        </span>
                        <span>{video.duration}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(video.status)}`}>
                    {video.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Submissions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                Review All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pendingSubmissions.map((submission, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 text-sm font-medium">
                        {submission.student.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{submission.student}</p>
                      <p className="text-xs text-gray-600">{submission.task}</p>
                      <p className="text-xs text-gray-500">{submission.submitted}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                    {submission.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Task Deadlines</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingTasks.map((task, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span className="text-xs text-gray-500">{task.students} students</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
                <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Upload Video</p>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
              <div className="text-center">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Create Task</p>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
              <div className="text-center">
                <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Send Feedback</p>
              </div>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <div className="text-center">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">View Students</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboardPage;