import React, { useEffect, useState } from 'react';
import { FileText, Calendar, Award, Clock, BookOpen } from 'lucide-react';

const TasksContent = ({ userId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost/api/student/get_tasks.php?user_id=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'INACTIVE': 'bg-gray-100 text-gray-800',
      'ARCHIVED': 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getTaskTypeBadge = (taskType) => {
    const colors = {
      'TEXT': 'bg-blue-100 text-blue-800',
      'FILE': 'bg-purple-100 text-purple-800',
      'BOTH': 'bg-orange-100 text-orange-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[taskType] || 'bg-gray-100 text-gray-800'}`;
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const formatDueDate = (dueDate) => {
    const date = new Date(dueDate);
    const now = new Date();
    const isOverdueTask = date < now;
    
    return (
      <span className={`flex items-center space-x-1 ${isOverdueTask ? 'text-red-600' : 'text-gray-600'}`}>
        <Calendar className="w-4 h-4" />
        <span>{date.toLocaleDateString()} at {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        {isOverdueTask && <span className="text-xs font-medium">(Overdue)</span>}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8 text-red-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-red-300" />
          <p>Error: {error}</p>
          <button 
            onClick={fetchTasks}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <span>Available Tasks</span>
        </h2>
        <div className="text-sm text-gray-500">
          Total: {tasks.length} tasks
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No tasks available yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructions</th>
                {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th> */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task, index) => (
                <tr key={task.id} className={`hover:bg-gray-50 ${isOverdue(task.due_date) ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {task.course_title || 'Unknown Course'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {task.title}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-600 max-w-xs">
                      <div className="line-clamp-2">
                        {task.description || 'No description'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-600 max-w-xs">
                      <div className="line-clamp-2">
                        {task.instructions || 'No instructions'}
                      </div>
                    </div>
                  </td>
                  {/* <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {formatDueDate(task.due_date)}
                  </td> */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {task.points || 0} pts
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={getTaskTypeBadge(task.task_type)}>
                      {task.task_type}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(task.status)}>
                      {task.status}
                    </span>
                  </td>
                  {/* <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => window.open(`/task/${task.id}`, '_blank')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                      {task.status === 'ACTIVE' && (
                        <button 
                          onClick={() => window.open(`/submit/${task.id}`, '_blank')}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      {tasks.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
            <div className="text-xs text-gray-600">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.status === 'ACTIVE').length}
            </div>
            <div className="text-xs text-gray-600">Active Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter(t => isOverdue(t.due_date) && t.status === 'ACTIVE').length}
            </div>
            <div className="text-xs text-gray-600">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {tasks.reduce((sum, t) => sum + (t.points || 0), 0)}
            </div>
            <div className="text-xs text-gray-600">Total Points</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksContent;