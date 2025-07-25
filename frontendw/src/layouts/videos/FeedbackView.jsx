import React, { useState } from 'react';
import { MessageCircle, Star, Calendar, User, FileText, Award, TrendingUp, Filter, Search } from 'lucide-react';

const FeedbackView = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample feedback data
  const feedbackData = [
    {
      id: 1,
      taskTitle: 'HTML Forms Assignment',
      instructor: 'Sarah Johnson',
      date: '2025-01-16',
      grade: 78,
      maxPoints: 80,
      rating: 4,
      comment: 'Good work! The form validation works well and the structure is clean. Consider adding more CSS styling to make it visually appealing. Also, try implementing some advanced validation patterns.',
      strengths: ['Clean HTML structure', 'Proper form validation', 'Good use of semantic elements'],
      improvements: ['Add more CSS styling', 'Consider accessibility features', 'Add error message styling'],
      type: 'assignment'
    },
    {
      id: 2,
      taskTitle: 'CSS Flexbox Quiz',
      instructor: 'Mike Chen',
      date: '2025-01-12',
      grade: 45,
      maxPoints: 50,
      rating: 4,
      comment: 'Excellent understanding of flexbox properties! You demonstrated good knowledge of flex-direction, justify-content, and align-items. Keep up the great work.',
      strengths: ['Strong flexbox knowledge', 'Correct property usage', 'Good problem-solving'],
      improvements: ['Review flex-wrap property', 'Practice more complex layouts'],
      type: 'quiz'
    },
    {
      id: 3,
      taskTitle: 'JavaScript Functions Project',
      instructor: 'Sarah Johnson',
      date: '2025-01-08',
      grade: 88,
      maxPoints: 100,
      rating: 5,
      comment: 'Outstanding work! Your code is well-structured and follows best practices. The use of arrow functions and higher-order functions shows advanced understanding. The project meets all requirements and goes above and beyond.',
      strengths: ['Excellent code structure', 'Advanced JavaScript concepts', 'Creative problem solving', 'Clean, readable code'],
      improvements: ['Consider adding more comments', 'Could optimize performance in some areas'],
      type: 'project'
    },
    {
      id: 4,
      taskTitle: 'React Components Workshop',
      instructor: 'Alex Rodriguez',
      date: '2025-01-05',
      grade: 92,
      maxPoints: 100,
      rating: 5,
      comment: 'Exceptional work on component composition and state management. Your understanding of props and state is excellent. The component hierarchy is well thought out.',
      strengths: ['Great component design', 'Proper state management', 'Good prop usage', 'Clean code organization'],
      improvements: ['Consider using useCallback for optimization', 'Add PropTypes for better development experience'],
      type: 'workshop'
    },
    {
      id: 5,
      taskTitle: 'CSS Grid Layout Challenge',
      instructor: 'Sarah Johnson',
      date: '2025-01-02',
      grade: 65,
      maxPoints: 75,
      rating: 3,
      comment: 'Good attempt at using CSS Grid. The basic layout works, but there are some issues with responsive design. Review grid-template-areas and media queries.',
      strengths: ['Basic grid implementation', 'Good HTML structure'],
      improvements: ['Improve responsive design', 'Better use of grid areas', 'Add fallbacks for older browsers'],
      type: 'assignment'
    }
  ];

  const filteredFeedback = feedbackData.filter(feedback => {
    const matchesFilter = activeFilter === 'all' || feedback.type === activeFilter;
    const matchesSearch = feedback.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getGradeColor = (grade, maxPoints) => {
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBgColor = (grade, maxPoints) => {
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'bg-green-100';
    if (percentage >= 80) return 'bg-blue-100';
    if (percentage >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const calculateOverallStats = () => {
    const totalGrades = feedbackData.reduce((sum, feedback) => sum + feedback.grade, 0);
    const totalMaxPoints = feedbackData.reduce((sum, feedback) => sum + feedback.maxPoints, 0);
    const averageRating = feedbackData.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbackData.length;
    
    return {
      averageGrade: (totalGrades / totalMaxPoints * 100).toFixed(1),
      averageRating: averageRating.toFixed(1),
      totalAssignments: feedbackData.length
    };
  };

  const stats = calculateOverallStats();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Average</p>
              <p className="text-2xl font-bold text-blue-600">{stats.averageGrade}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <div className="flex items-center space-x-1">
                <p className="text-2xl font-bold text-yellow-600">{stats.averageRating}</p>
                <div className="flex">
                  {renderStars(Math.round(parseFloat(stats.averageRating)))}
                </div>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalAssignments}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Assignment Feedback</h2>
          
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="assignment">Assignments</option>
                <option value="quiz">Quizzes</option>
                <option value="project">Projects</option>
                <option value="workshop">Workshops</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback Cards */}
        <div className="space-y-6">
          {filteredFeedback.map(feedback => (
            <div key={feedback.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{feedback.taskTitle}</h3>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium capitalize">
                      {feedback.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{feedback.instructor}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(feedback.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeBgColor(feedback.grade, feedback.maxPoints)} ${getGradeColor(feedback.grade, feedback.maxPoints)}`}>
                    {feedback.grade}/{feedback.maxPoints} ({Math.round((feedback.grade / feedback.maxPoints) * 100)}%)
                  </div>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    {renderStars(feedback.rating)}
                  </div>
                </div>
              </div>

              {/* Comment */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Instructor Feedback</span>
                </div>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{feedback.comment}</p>
              </div>

              {/* Strengths and Improvements */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>Strengths</span>
                  </h4>
                  <ul className="space-y-1">
                    {feedback.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Areas for Improvement</span>
                  </h4>
                  <ul className="space-y-1">
                    {feedback.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFeedback.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No feedback found for the selected criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackView;