import React, { useState } from 'react';
import { 
  MessageSquare,
  Star
} from 'lucide-react';

const FeedbackPage = () => {
  const [selectedType, setSelectedType] = useState('all');

  const feedbackItems = [
    { id: 1, student: 'Alice Johnson', task: 'React Portfolio Project', type: 'assignment', rating: 4, comment: 'Great work on the component structure!', date: '2025-01-20' },
    { id: 2, student: 'Bob Smith', task: 'JavaScript Quiz', type: 'quiz', rating: 5, comment: 'Excellent understanding of concepts', date: '2025-01-19' },
    { id: 3, student: 'Carol Wilson', task: 'CSS Layout Challenge', type: 'assignment', rating: 3, comment: 'Good effort, but needs improvement in responsive design', date: '2025-01-18' },
    { id: 4, student: 'David Brown', task: 'General Course', type: 'course', rating: 5, comment: 'Very engaging and helpful instructor', date: '2025-01-17' },
    { id: 5, student: 'Emma Davis', task: 'JavaScript Quiz', type: 'quiz', rating: 4, comment: 'Clear explanations, minor syntax issues', date: '2025-01-16' }
  ];

  const filteredFeedback = feedbackItems.filter(item => 
    selectedType === 'all' || item.type === selectedType
  );

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
        aria-label={i < rating ? 'Filled star' : 'Empty star'}
      />
    ));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
          <p className="text-gray-600">Student feedback and instructor responses</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center">
          <MessageSquare className="w-4 h-4 mr-2" />
          Send Feedback
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Feedback</option>
            <option value="assignment">Assignments</option>
            <option value="quiz">Quizzes</option>
            <option value="course">Course Feedback</option>
          </select>
        </div>
      </div>

      {/* Feedback Cards */}
      <div className="space-y-4">
        {filteredFeedback.map((feedback) => (
          <div key={feedback.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-medium">
                    {feedback.student.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feedback.student}</h3>
                  <p className="text-sm text-gray-500">{feedback.task}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex">{renderStars(feedback.rating)}</div>
                <span className="text-sm text-gray-500">{feedback.date}</span>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{feedback.comment}</p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                Reply
              </button>
              <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                Mark as Read
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackPage;