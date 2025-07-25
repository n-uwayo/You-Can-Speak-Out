import React, { useState } from 'react';
import { Calendar, Clock, FileText, CheckCircle, AlertCircle, Upload } from 'lucide-react';

const TaskList = ({ onSelectTask, selectedTask }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  // Sample tasks from instructor
  const tasks = [
    {
      id: 1,
      title: 'React Portfolio Project',
      description: 'Create a personal portfolio website using React. Include at least 5 components and implement routing.',
      dueDate: '2025-01-25',
      dueTime: '23:59',
      status: 'pending',
      type: 'assignment',
      points: 100,
      submitted: false,
      feedback: null
    },
    {
      id: 2,
      title: 'JavaScript Quiz - ES6 Features',
      description: 'Complete the quiz covering arrow functions, destructuring, and async/await.',
      dueDate: '2025-01-22',
      dueTime: '18:00',
      status: 'overdue',
      type: 'quiz',
      points: 50,
      submitted: false,
      feedback: null
    },
    {
      id: 3,
      title: 'CSS Layout Challenge',
      description: 'Recreate the provided design using CSS Grid and Flexbox. Make it responsive.',
      dueDate: '2025-01-28',
      dueTime: '20:00',
      status: 'pending',
      type: 'assignment',
      points: 75,
      submitted: false,
      feedback: null
    },
    {
      id: 4,
      title: 'HTML Forms Assignment',
      description: 'Build a contact form with validation using HTML5 and JavaScript.',
      dueDate: '2025-01-15',
      dueTime: '23:59',
      status: 'completed',
      type: 'assignment',
      points: 80,
      submitted: true,
      grade: 78,
      feedback: {
        comment: 'Good work! The form validation works well. Consider adding more styling.',
        instructor: 'Sarah Johnson',
        date: '2025-01-16'
      }
    }
  ];

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return task.status === 'pending';
    if (activeFilter === 'completed') return task.status === 'completed';
    if (activeFilter === 'overdue') return task.status === 'overdue';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const isOverdue = (dueDate, dueTime) => {
    const now = new Date();
    const due = new Date(`${dueDate} ${dueTime}`);
    return now > due;
  };

  const formatDueDate = (dueDate, dueTime) => {
    const date = new Date(`${dueDate} ${dueTime}`);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Tasks</h2>
        
        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          {[
            { key: 'all', label: 'All Tasks', count: tasks.length },
            { key: 'pending', label: 'Pending', count: tasks.filter(t => t.status === 'pending').length },
            { key: 'overdue', label: 'Overdue', count: tasks.filter(t => t.status === 'overdue').length },
            { key: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'completed').length }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeFilter === filter.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {getStatusIcon(task.status)}
                      <span className="capitalize">{task.status}</span>
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium capitalize">
                      {task.type}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {formatDueDate(task.dueDate, task.dueTime)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>{task.points} points</span>
                  </div>
                  {task.submitted && task.grade && (
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 font-medium">Grade: {task.grade}/{task.points}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {task.status === 'completed' && task.feedback && (
                    <button
                      onClick={() => onSelectTask(task)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-200"
                    >
                      View Feedback
                    </button>
                  )}
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => onSelectTask(task)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-1"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{task.submitted ? 'Resubmit' : 'Submit'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Show feedback preview if completed */}
              {task.status === 'completed' && task.feedback && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 mb-1">
                    <strong>Instructor Feedback:</strong> {task.feedback.comment}
                  </p>
                  <p className="text-xs text-green-600">
                    by {task.feedback.instructor} on {task.feedback.date}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tasks found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;