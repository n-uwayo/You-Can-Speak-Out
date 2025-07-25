import React, { useState } from 'react';
import { Search, Filter, Star, MessageSquare, ThumbsUp, ThumbsDown, AlertCircle, CheckCircle, Eye, Reply } from 'lucide-react';

const FeedbackPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const feedbacks = [
    {
      id: 1,
      student: 'Alice Johnson',
      course: 'Advanced React',
      instructor: 'Sarah Wilson',
      type: 'course',
      rating: 5,
      title: 'Excellent course content',
      message: 'The course was very well structured and the instructor explained complex concepts clearly. The hands-on projects were particularly helpful.',
      date: '2024-03-15',
      status: 'resolved',
      priority: 'low',
      category: 'Content Quality'
    },
    {
      id: 2,
      student: 'Bob Smith',
      course: 'Database Management',
      instructor: 'Mike Johnson',
      type: 'instructor',
      rating: 2,
      title: 'Poor audio quality in videos',
      message: 'The instructor knows the subject well but the audio quality in several videos is very poor, making it difficult to follow along.',
      date: '2024-03-14',
      status: 'pending',
      priority: 'high',
      category: 'Technical Issues'
    },
    {
      id: 3,
      student: 'Carol Williams',
      course: 'UI/UX Design',
      instructor: 'Emily Davis',
      type: 'platform',
      rating: 4,
      title: 'Great platform, minor bugs',
      message: 'Overall the platform is user-friendly and intuitive. However, I encountered some bugs when submitting assignments on mobile.',
      date: '2024-03-13',
      status: 'in-progress',
      priority: 'medium',
      category: 'Platform Issues'
    },
    {
      id: 4,
      student: 'David Brown',
      course: 'Python Fundamentals',
      instructor: 'Alex Brown',
      type: 'course',
      rating: 5,
      title: 'Perfect for beginners',
      message: 'As someone new to programming, this course was perfect. The pacing was just right and the examples were very practical.',
      date: '2024-03-12',
      status: 'resolved',
      priority: 'low',
      category: 'Content Quality'
    },
    {
      id: 5,
      student: 'Emma Davis',
      course: 'Digital Marketing',
      instructor: 'Lisa Johnson',
      type: 'instructor',
      rating: 3,
      title: 'Good content but slow responses',
      message: 'The course content is valuable but the instructor takes too long to respond to questions in the discussion forum.',
      date: '2024-03-11',
      status: 'pending',
      priority: 'medium',
      category: 'Communication'
    },
    {
      id: 6,
      student: 'Frank Wilson',
      course: 'JavaScript Advanced',
      instructor: 'John Smith',
      type: 'course',
      rating: 1,
      title: 'Outdated content',
      message: 'The course content seems outdated and doesn\'t cover modern JavaScript features that are commonly used today.',
      date: '2024-03-10',
      status: 'pending',
      priority: 'high',
      category: 'Content Quality'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = feedback.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || feedback.type === typeFilter;
    const matchesRating = ratingFilter === 'all' || feedback.rating.toString() === ratingFilter;
    const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;
    return matchesSearch && matchesType && matchesRating && matchesStatus;
  });

  const feedbackStats = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => f.status === 'pending').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length,
    avgRating: feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Feedback</h1>
        <p className="text-gray-600 mt-2">Manage and respond to student feedback and reviews</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{feedbackStats.total}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{feedbackStats.pending}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{feedbackStats.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{feedbackStats.avgRating.toFixed(1)}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
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
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="course">Course</option>
              <option value="instructor">Instructor</option>
              <option value="platform">Platform</option>
            </select>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Cards */}
      <div className="space-y-6">
        {filteredFeedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{feedback.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(feedback.status)}`}>
                    {feedback.status.replace('-', ' ')}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(feedback.priority)}`}>
                    {feedback.priority} priority
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <span>{feedback.student}</span>
                  <span>•</span>
                  <span>{feedback.course}</span>
                  <span>•</span>
                  <span>{feedback.instructor}</span>
                  <span>•</span>
                  <span>{feedback.date}</span>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center">
                    {renderStars(feedback.rating)}
                  </div>
                  <span className="text-sm text-gray-600">({feedback.rating}/5)</span>
                  <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {feedback.type}
                  </span>
                  <span className="text-sm px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                    {feedback.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-blue-600 hover:text-blue-900" title="View Details">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="text-green-600 hover:text-green-900" title="Reply">
                  <Reply className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">{feedback.message}</p>
            </div>

            {feedback.status === 'pending' && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Mark as In Progress
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Mark as Resolved
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Reply to Student
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredFeedbacks.length}</span> of{' '}
          <span className="font-medium">{feedbacks.length}</span> results
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;