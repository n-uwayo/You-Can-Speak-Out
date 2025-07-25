import React, { useState, useEffect } from 'react';
import { Users, Video, FileText, MessageSquare, TrendingUp, Award, Plus, Eye, Calendar, Clock, Bell, Settings, Search, Filter, RefreshCw, Loader } from 'lucide-react';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    total_users: 0,
    total_videos: 0,
    active_tasks: 0,
    total_feedback: 0,
    recent_activities: [],
    top_performers: [],
    additional_stats: {
      total_enrollments: 0,
      active_students: 0,
      total_instructors: 0,
      published_courses: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // API base URL - update this to match your server
  const API_BASE = 'https://ycspout.umwalimu.com/api';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/dashboard.php`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle both wrapped and direct response formats
      if (data.success && data.data) {
        setDashboardData(data.data);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        // Direct data response
        setDashboardData({
          total_users: data.total_users || 0,
          total_videos: data.total_videos || 0,
          active_tasks: data.active_tasks || 0,
          total_feedback: data.total_feedback || 0,
          recent_activities: data.recent_activities || [],
          top_performers: data.top_performers || [],
          additional_stats: data.additional_stats || {
            total_enrollments: 0,
            active_students: 0,
            total_instructors: 0,
            published_courses: 0
          }
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const calculateGrowth = (current, previous = 0) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const growth = ((current - previous) / previous * 100).toFixed(1);
    return growth > 0 ? `+${growth}%` : `${growth}%`;
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration': return <Users className="w-4 h-4 text-blue-500" />;
      case 'video_upload': return <Video className="w-4 h-4 text-green-500" />;
      case 'task_submission': return <FileText className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityMessage = (activity) => {
    return activity.name || 'Unknown activity';
  };

  const stats = [
    { 
      title: 'Total Users', 
      value: dashboardData.total_users, 
      change: calculateGrowth(dashboardData.total_users, dashboardData.total_users - 5), 
      icon: Users, 
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      title: 'Published Videos', 
      value: dashboardData.additional_stats.published_courses, 
      change: calculateGrowth(dashboardData.additional_stats.published_courses, dashboardData.additional_stats.published_courses - 2), 
      icon: Video, 
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    { 
      title: 'Active Tasks', 
      value: dashboardData.active_tasks, 
      change: calculateGrowth(dashboardData.active_tasks, dashboardData.active_tasks - 1), 
      icon: FileText, 
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    { 
      title: 'Total Feedback', 
      value: dashboardData.total_feedback, 
      change: calculateGrowth(dashboardData.total_feedback, dashboardData.total_feedback - 3), 
      icon: MessageSquare, 
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
  ];

  if (loading && !refreshing) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error && !refreshing) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
              <p className="mt-1 text-sm text-red-600">{error}</p>
              <button 
                onClick={fetchDashboardData}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning Management Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your platform.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            {/* <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button> */}
            {/* <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button> */}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8 border-b border-gray-200">
          {['overview', 'users', ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value.toLocaleString()}</p>
                  <div className="flex items-center">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                    <span className="text-xs text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
                <div className={`${stat.color} rounded-xl p-3 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats */}
      {dashboardData.additional_stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Total Enrollments</p>
            <p className="text-2xl font-bold text-gray-900">{dashboardData.additional_stats.total_enrollments}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Active Students</p>
            <p className="text-2xl font-bold text-gray-900">{dashboardData.additional_stats.active_students}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Total Instructors</p>
            <p className="text-2xl font-bold text-gray-900">{dashboardData.additional_stats.total_instructors}</p>
          </div>
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Published Courses</p>
            <p className="text-2xl font-bold text-gray-900">{dashboardData.additional_stats.published_courses}</p>
          </div> */}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {dashboardData.recent_activities && dashboardData.recent_activities.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recent_activities.slice(0, 6).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">
                        {getActivityMessage(activity)}
                      </p>
                      <div className="flex items-center mt-1">
                        <Clock className="w-3 h-3 text-gray-400 mr-1" />
                        <p className="text-xs text-gray-500">{formatTimeAgo(activity.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent activities</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Top Performers</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View Leaderboard
              </button>
            </div>
          </div>
          <div className="p-6">
            {dashboardData.top_performers && dashboardData.top_performers.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.top_performers.slice(0, 5).map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white text-sm font-bold">
                            {performer.name ? performer.name.split(' ').map(n => n[0]).join('') : '?'}
                          </span>
                        </div>
                        {index < 3 && (
                          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                          }`}>
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{performer.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{performer.courses_completed || 0} courses completed</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-bold text-gray-900">{performer.score || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No performance data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-600 mt-1">Common tasks and shortcuts</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Add New User', color: 'hover:border-blue-500 hover:bg-blue-50', iconColor: 'text-blue-500' },
              { icon: Video, label: 'Upload Video', color: 'hover:border-green-500 hover:bg-green-50', iconColor: 'text-green-500' },
              { icon: FileText, label: 'Create Task', color: 'hover:border-purple-500 hover:bg-purple-50', iconColor: 'text-purple-500' },
              // { icon: Plus, label: 'New Course', color: 'hover:border-orange-500 hover:bg-orange-50', iconColor: 'text-orange-500' }
            ].map((action, index) => (
              <button key={index} className={`group flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl transition-all duration-200 ${action.color}`}>
                <action.icon className={`w-8 h-8 ${action.iconColor} mb-3 group-hover:scale-110 transition-transform`} />
                <p className="text-sm font-medium text-gray-900">{action.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div> */}

      {/* Refresh Button */}
      <div className="mt-8 flex justify-center">
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {refreshing ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              <span>Refresh Data</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;