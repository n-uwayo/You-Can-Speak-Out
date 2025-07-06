import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, Bell, Menu, X, Play, FileText, MessageCircle, ChevronDown, ChevronRight, Clock, CheckCircle, AlertCircle, Upload, File, Loader, LogOut } from 'lucide-react';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('course');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [currentVideo, setCurrentVideo] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  
  // API related state
  const [courseData, setCourseData] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [submissionLoading, setSubmissionLoading] = useState(false);

  const navigate = useNavigate();

  // PHP API base URL
  const API_BASE_URL = 'https://ycspout.umwalimu.com/api';

  // Check authentication
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token || currentUser.role !== 'STUDENT') {
      navigate('/login');
      return;
    }
    
    fetchCourseData();
    fetchUserProgress();
    fetchTasks();
  }, [token, currentUser.role, navigate]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/student/course.php`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course data');
      }

      const data = await response.json();
      
      if (data.success) {
        setCourseData(data.data);
      } else {
        throw new Error(data.message || 'Failed to load course data');
      }
    } catch (err) {
      console.error('Error fetching course data:', err);
      setError(err.message);
      // Use fallback data for demo
      setCourseData(getFallbackCourseData());
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/progress.php`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserProgress(data.data || {});
        }
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/tasks.php`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTasks(data.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchComments = async (videoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/comments.php?video_id=${videoId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setComments(prev => ({
            ...prev,
            [videoId]: data.data || []
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const markVideoComplete = async (videoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/progress.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          video_id: videoId,
          completed: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserProgress(prev => ({
            ...prev,
            [videoId]: { completed: true, completed_at: new Date().toISOString() }
          }));
          showMessage('Video marked as completed!', 'success');
        }
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      showMessage('Failed to update progress', 'error');
    }
  };

  const submitTask = async (taskId, submissionData) => {
    setSubmissionLoading(true);
    try {
      const formData = new FormData();
      formData.append('task_id', taskId);
      formData.append('submission_type', submissionData.type);
      formData.append('text_content', submissionData.textContent || '');
      formData.append('comment', submissionData.comment || '');
      
      // Add files if any
      if (submissionData.files) {
        submissionData.files.forEach((file, index) => {
          formData.append(`files[${index}]`, file);
        });
      }

      const response = await fetch(`${API_BASE_URL}/student/submissions.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('Assignment submitted successfully!', 'success');
        fetchTasks(); // Refresh tasks
        return true;
      } else {
        throw new Error(data.message || 'Failed to submit assignment');
      }
    } catch (err) {
      console.error('Error submitting task:', err);
      showMessage(err.message || 'Failed to submit assignment', 'error');
      return false;
    } finally {
      setSubmissionLoading(false);
    }
  };

  const addComment = async (videoId) => {
    if (!newComment.trim()) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/student/comments.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          video_id: videoId,
          comment: newComment.trim()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const newCommentObj = {
          id: data.data.id,
          user_name: currentUser.name,
          comment: newComment,
          created_at: new Date().toISOString(),
          replies: []
        };

        setComments(prev => ({
          ...prev,
          [videoId]: [...(prev[videoId] || []), newCommentObj]
        }));
        setNewComment('');
        showMessage('Comment added successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      showMessage('Failed to add comment', 'error');
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/auth.php?action=logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      showMessage('Logged out successfully', 'success');
      setTimeout(() => navigate('/login'), 1000);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Fallback data for demonstration
  const getFallbackCourseData = () => ({
    id: 1,
    title: "Complete Web Development Course",
    description: "Master web development from frontend to backend",
    modules: [
      {
        id: 1,
        title: "Introduction to HTML",
        description: "Learn the fundamentals of HTML markup",
        order_index: 1,
        videos: [
          { id: 1, title: "What is HTML?", duration: "15:30", order_index: 1 },
          { id: 2, title: "HTML Document Structure", duration: "12:45", order_index: 2 },
          { id: 3, title: "Common HTML Tags", duration: "18:20", order_index: 3 },
          { id: 4, title: "HTML Forms", duration: "22:15", order_index: 4 }
        ],
        tasks: [
          {
            id: 1,
            title: "Create Your First HTML Page",
            description: "Build a simple HTML page with basic structure and content",
            due_date: "2025-01-25",
            points: 50,
            status: "pending"
          }
        ]
      },
      {
        id: 2,
        title: "CSS Fundamentals",
        description: "Master CSS styling and layouts",
        order_index: 2,
        videos: [
          { id: 5, title: "CSS Basics", duration: "16:40", order_index: 1 },
          { id: 6, title: "CSS Selectors", duration: "14:25", order_index: 2 },
          { id: 7, title: "CSS Box Model", duration: "19:30", order_index: 3 },
          { id: 8, title: "CSS Flexbox", duration: "25:10", order_index: 4 }
        ],
        tasks: [
          {
            id: 2,
            title: "Style Your HTML Page",
            description: "Add CSS styling to your previously created HTML page",
            due_date: "2025-02-01",
            points: 60,
            status: "pending"
          }
        ]
      }
    ]
  });

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const selectVideo = (video, moduleId) => {
    setCurrentVideo({ ...video, moduleId });
    if (!comments[video.id]) {
      fetchComments(video.id);
    }
  };

  const isVideoCompleted = (videoId) => {
    return userProgress[videoId]?.completed || false;
  };

  const getModuleProgress = (module) => {
    if (!module.videos || module.videos.length === 0) return 0;
    const completedVideos = module.videos.filter(v => isVideoCompleted(v.id)).length;
    return Math.round((completedVideos / module.videos.length) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const MessageNotification = () => {
    if (!message.text) return null;

    return (
      <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        message.type === 'success' 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}>
        <div className="flex items-center space-x-2">
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
          <button 
            onClick={() => setMessage({ text: '', type: '' })}
            className="ml-2 hover:opacity-80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const CourseContent = () => (
    <div className="space-y-6">
      {/* Current Video Player */}
      {currentVideo && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">{currentVideo.title}</h3>
              <p className="text-gray-300">Duration: {currentVideo.duration}</p>
              <button
                onClick={() => markVideoComplete(currentVideo.id)}
                disabled={isVideoCompleted(currentVideo.id)}
                className={`mt-4 px-6 py-2 rounded-lg transition-all ${
                  isVideoCompleted(currentVideo.id)
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isVideoCompleted(currentVideo.id) ? 'Completed' : 'Mark as Complete'}
              </button>
            </div>
          </div>
          
          {/* Video Info and Comments */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{currentVideo.title}</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {currentVideo.duration}
              </span>
            </div>

            {/* Comments Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Comments ({comments[currentVideo.id]?.length || 0})
              </h3>

              {/* Add Comment */}
              <div className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment or ask a question..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <button
                  onClick={() => addComment(currentVideo.id)}
                  disabled={!newComment.trim()}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Post Comment
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments[currentVideo.id]?.map(comment => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{comment.user_name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{comment.comment}</p>
                    
                    {/* Replies */}
                    {comment.replies?.map(reply => (
                      <div key={reply.id} className="ml-6 mt-3 bg-white rounded-lg p-3 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{reply.user_name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(reply.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{reply.comment}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Modules */}
      {courseData && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{courseData.title}</h2>
          
          <div className="space-y-4">
            {courseData.modules?.map(module => (
              <div key={module.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {expandedModules[module.id] ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{module.title}</h3>
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {module.videos?.filter(v => isVideoCompleted(v.id)).length || 0}/{module.videos?.length || 0} videos
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      {getModuleProgress(module)}% complete
                    </div>
                  </div>
                </button>

                {expandedModules[module.id] && (
                  <div className="border-t border-gray-200 p-4">
                    {/* Videos */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Videos</h4>
                      <div className="grid gap-2">
                        {module.videos?.map(video => (
                          <button
                            key={video.id}
                            onClick={() => selectVideo(video, module.id)}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                              currentVideo?.id === video.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isVideoCompleted(video.id) ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                                {isVideoCompleted(video.id) ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Play className="w-4 h-4 text-gray-600" />
                                )}
                              </div>
                              <span className="font-medium text-gray-900">{video.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">{video.duration}</span>
                              {comments[video.id]?.length > 0 && (
                                <div className="flex items-center space-x-1 text-blue-600">
                                  <MessageCircle className="w-4 h-4" />
                                  <span className="text-sm">{comments[video.id].length}</span>
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tasks */}
                    {module.tasks?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Tasks</h4>
                        <div className="space-y-2">
                          {module.tasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{task.title}</h5>
                                <p className="text-sm text-gray-600">{task.description}</p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                  <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                                  <span>{task.points} points</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                                <button
                                  onClick={() => setSelectedTask(task)}
                                  disabled={task.status === 'submitted' || task.status === 'completed'}
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {task.status === 'submitted' ? 'Submitted' : 'Submit'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EduPlatform</h1>
                <p className="text-xs text-gray-500">Student Portal</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('course')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'course' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Course Content
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'tasks' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Tasks
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <Bell className="w-5 h-5 text-gray-600" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {currentUser.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button
                className="md:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('course');
                    setShowMobileMenu(false);
                  }}
                  className={`text-left px-4 py-2 rounded-lg ${
                    activeTab === 'course' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
                  }`}
                >
                  Course Content
                </button>
                <button
                  onClick={() => {
                    setActiveTab('tasks');
                    setShowMobileMenu(false);
                  }}
                  className={`text-left px-4 py-2 rounded-lg ${
                    activeTab === 'tasks' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
                  }`}
                >
                  All Tasks
                </button>
                <button
                  onClick={handleLogout}
                  className="text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {activeTab === 'course' && <CourseContent />}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Tasks</h2>
            <div className="space-y-4">
              {tasks.map(task => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-600">{task.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        <span>{task.points} points</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <button
                        onClick={() => setSelectedTask(task)}
                        disabled={task.status === 'submitted' || task.status === 'completed'}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {task.status === 'submitted' ? 'Submitted' : 'Submit'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {selectedTask && (
        <SubmissionModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSubmit={submitTask}
          loading={submissionLoading}
        />
      )}

      <MessageNotification />
    </div>
  );
};

// Enhanced Submission Modal Component
const SubmissionModal = ({ task, onClose, onSubmit, loading }) => {
  const [submissionType, setSubmissionType] = useState('text');
  const [textSubmission, setTextSubmission] = useState('');
  const [comment, setComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const removeFile = (index) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const submissionData = {
      type: submissionType,
      textContent: textSubmission,
      comment: comment,
      files: selectedFiles
    };

    const success = await onSubmit(task.id, submissionData);
    if (success) {
      onClose();
    }
  };

  const canSubmit = () => {
    if (submissionType === 'text') return textSubmission.trim();
    if (submissionType === 'file') return selectedFiles.length > 0;
    if (submissionType === 'both') return textSubmission.trim() && selectedFiles.length > 0;
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Submit Assignment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Task Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900">{task.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
              <span>{task.points} points</span>
            </div>
          </div>

          {/* Submission Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Submission Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="text"
                  checked={submissionType === 'text'}
                  onChange={(e) => setSubmissionType(e.target.value)}
                  className="mr-2"
                />
                <FileText className="w-4 h-4 mr-1" />
                Text Only
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="file"
                  checked={submissionType === 'file'}
                  onChange={(e) => setSubmissionType(e.target.value)}
                  className="mr-2"
                />
                <Upload className="w-4 h-4 mr-1" />
                File Only
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="both"
                  checked={submissionType === 'both'}
                  onChange={(e) => setSubmissionType(e.target.value)}
                  className="mr-2"
                />
                Both
              </label>
            </div>
          </div>

          {/* Text Submission */}
          {(submissionType === 'text' || submissionType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Submission
              </label>
              <textarea
                value={textSubmission}
                onChange={(e) => setTextSubmission(e.target.value)}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your assignment submission here..."
              />
            </div>
          )}

          {/* File Upload */}
          {(submissionType === 'file' || submissionType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Upload
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop files here, or click to select
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700"
                >
                  Choose Files
                </label>
              </div>
              
              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Selected Files ({selectedFiles.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <File className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any additional comments or questions for your instructor..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit() || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Submitting...' : 'Submit Assignment'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;