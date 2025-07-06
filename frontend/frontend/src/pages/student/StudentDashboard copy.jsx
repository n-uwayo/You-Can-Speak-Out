import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Star, 
  Users, 
  Clock, 
  BookOpen, 
  Search, 
  ChevronRight,
  Award,
  Video,
  User,
  Menu,
  X,
  Mic,
  MessageCircle,
  Volume2,
  Upload,
  Download,
  CheckCircle,
  Circle,
  Calendar,
  Target,
  TrendingUp,
  FileText,
  Headphones,
  Camera,
  Send,
  Eye,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Book,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Settings,
  LogOut,
  Home,
  GraduationCap,
  Bell,
  Loader,
  AlertTriangle,
  RefreshCw,
  Share,
  Bookmark,
  Heart
} from 'lucide-react';

// API Service
const API_BASE_URL = 'http://localhost/api';

const apiService = {
  // Get authorization headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  },

  // Get all courses (student will see only enrolled ones based on backend logic)
  async getEnrolledCourses() {
    try {
      const response = await fetch(`${API_BASE_URL}/courses.php`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch courses');
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      throw error;
    }
  },

  // Get course details with modules and enrollment info
  async getCourseDetail(courseId) {
    try {
      const response = await fetch(`${API_BASE_URL}/student/course.php?course_id=${courseId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch course details');
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching course detail:', error);
      throw error;
    }
  },

  // Update video progress
  async updateVideoProgress(videoId, watchedSeconds, isCompleted = false) {
    try {
      const response = await fetch(`${API_BASE_URL}/student/progress.php`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          action: 'update_video_progress',
          video_id: videoId,
          watched_seconds: watchedSeconds,
          is_completed: isCompleted
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating video progress:', error);
      throw error;
    }
  },

  // Submit task
  async submitTask(taskId, textSubmission = null, fileUrls = null, comment = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/student/submissions.php`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          action: 'submit_task',
          task_id: taskId,
          text_submission: textSubmission,
          file_urls: fileUrls,
          comment: comment
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error submitting task:', error);
      throw error;
    }
  },

  async getComments(videoId = null, courseId = null, limit = 50, offset = 0) {
    try {
      const params = new URLSearchParams();
      if (videoId) params.append('video_id', videoId);
      if (courseId) params.append('course_id', courseId);
      params.append('limit', limit);
      params.append('offset', offset);
console.log(params.toString());
      const response = await fetch(`${API_BASE_URL}/student/get_comments.php?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch comments');
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Submit comment
  async submitComment(comment,courseId) {
  try {
    const response = await fetch("http://localhost/api/student/comment.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ comment,
        courseId: courseId, }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      const message = result?.message || "Failed to submit comment.";
      throw new Error(message);
    }

    return result.data; // returns { id, text, created_at }
  } catch (error) {
    console.error("Error submitting comment:", error.message);
    throw error;
  }
},


  // Get user profile
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'STUDENT'
    };
  },

  // Check if user is authenticated
  isAuthenticated() {
    return true; // Mock authentication for demo
  }
};

const StudentDashboard = () => {
  const [currentView, setCurrentView] = useState('overview');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Data states
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courseDetail, setCourseDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Video comment states
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [videoLiked, setVideoLiked] = useState(false);
  const [videoDisliked, setVideoDisliked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });


  const loadComments = async (videoId = null, courseId = null) => {
    try {
      setCommentsLoading(true);
      setError(null);
      
      const response = await apiService.getComments(videoId, courseId);
      
      if (response.success) {
        setComments(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to load comments');
      }
    } catch (err) {
      console.error('Error loading comments:', err);
      setError(err.message);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Get current user
  const currentUser = apiService.getCurrentUser() || {
    id: 4,
    name: 'Student User',
    email: 'student@example.com',
    role: 'STUDENT'
  };
  

  // Handle comment submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!comment.trim()) return;

    setIsSubmitting(true);

    try {
      await apiService.submitComment(comment,courseDetail.id);
      setComment(""); // Clear input after successful submission
      showMessage('Comment submitted successfully!', 'success');
      
      // Add comment to local state for immediate feedback
      const newCommentObj = {
        id: Date.now(),
        text: comment,
        courseId: courseDetail.id,
        user: { name: currentUser.name },
        timestamp: 'Just now',
        likes: 0,
        replies: []
      };
      setComments(prev => [newCommentObj, ...prev]);
      
    } catch (error) {
      console.error("Error:", error);
      showMessage('Failed to submit comment', 'error');
    }

    setIsSubmitting(false);
  };

  // Handle like comment
  const handleLikeComment = (commentId, isReply = false, parentId = null) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, likes: comment.likes + 1 };
      }
      if (isReply && comment.id === parentId) {
        return {
          ...comment,
          replies: comment.replies.map(reply => 
            reply.id === commentId 
              ? { ...reply, likes: reply.likes + 1 }
              : reply
          )
        };
      }
      return comment;
    }));
  };

  // Handle add reply
  const handleAddReply = (commentId) => {
    if (!replyText.trim()) return;

    const newReply = {
      id: Date.now(),
      text: replyText,
      user: { name: currentUser.name },
      timestamp: 'Just now',
      likes: 0
    };

    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...comment.replies, newReply] }
        : comment
    ));

    setReplyText('');
    setReplyTo(null);
  };

  // Check authentication
  useEffect(() => {
    // Load initial data
    loadEnrolledCourses();
    // loadComments(null, selectedCourse.id);
  }, []);

  // Load comments when course changes
useEffect(() => {
  if (currentView === 'course' && selectedCourse) {
    // Load comments for the current course
    loadComments(null, selectedCourse.id);
  }
}, [currentView, selectedCourse]);

  // Load enrolled courses
  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getEnrolledCourses();
      // console.log(response);  
      if (response.success) {
        // Filter courses for enrolled students (this logic might be handled on backend)
        const courses = Array.isArray(response.data) ? response.data : [];
        
        // Transform courses to include student-specific data
        const transformedCourses = courses.map(course => ({
          ...course,
          instructor_name: course.instructor?.name || 'Unknown Instructor',
          progress: 50, // Mock progress - should come from backend
          total_videos: course.modules?.length || 0,
          status: course.is_published ? 'ACTIVE' : 'INACTIVE',
          enrolled_at: course.created_at || new Date().toISOString()
        }));
        
        setEnrolledCourses(transformedCourses);
      } else {
        throw new Error(response.message || 'Failed to load courses');
      }
    } catch (err) {
      console.error('Error loading courses:', err);
      setError(err.message);
      setEnrolledCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Load course detail
  const loadCourseDetail = async (courseId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getCourseDetail(courseId);
      // console.log(response);
      
      if (response.success) {
        const course = response.data;
        
        // Transform course detail to match expected structure
        const transformedCourse = {
          ...course,
          instructor_name: course.instructor?.name || 'Unknown Instructor',
          progress: Math.floor(Math.random() * 100), // Mock progress
          enrollment_status: course.is_published ? 'ACTIVE' : 'INACTIVE',
          modules: course.modules?.map(module => ({
            ...module,
            is_completed: Math.random() > 0.5, // Mock completion status
            completion_percentage: Math.floor(Math.random() * 100),
            total_videos: Math.floor(Math.random() * 10) + 1,
            total_tasks: Math.floor(Math.random() * 5) + 1,
            videos: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, i) => ({
              id: `video_${module.id}_${i}`,
              title: `Video ${i + 1}`,
              duration: `${Math.floor(Math.random() * 20) + 5}:00`,
              is_completed: Math.random() > 0.5
            })),
            tasks: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
              id: `task_${module.id}_${i}`,
              title: `Assignment ${i + 1}`,
              description: `Complete this speaking exercise for module ${module.title}`,
              submission_status: Math.random() > 0.7 ? 'GRADED' : (Math.random() > 0.5 ? 'SUBMITTED' : null),
              grade: Math.random() > 0.7 ? Math.floor(Math.random() * 40) + 60 : null
            }))
          })) || []
        };
        
        setCourseDetail(transformedCourse);
      } else {
        throw new Error(response.message || 'Failed to load course details');
      }
    } catch (err) {
      console.error('Error loading course detail:', err);
      setError(err.message);
      showMessage('Failed to load course details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    try {
      if (currentView === 'courses' || currentView === 'overview') {
        await loadEnrolledCourses();
      } else if (currentView === 'course' && selectedCourse) {
        await loadCourseDetail(selectedCourse.id);
      }
      showMessage('Data refreshed successfully', 'success');
    } catch (err) {
      showMessage('Failed to refresh data', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle video completion
  const handleVideoComplete = async (videoId) => {
    try {
      const response = await apiService.updateVideoProgress(videoId, 0, true);
      
      if (response.success) {
        showMessage('Video marked as completed!', 'success');
        
        // Refresh course detail to update progress
        if (selectedCourse) {
          await loadCourseDetail(selectedCourse.id);
        }
        
        // Refresh enrolled courses to update overall progress
        await loadEnrolledCourses();
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('Error updating video progress:', err);
      showMessage('Failed to update video progress', 'error');
    }
  };

  // Handle task submission
  const handleTaskSubmission = async (taskId, textSubmission, fileUrls = null, comment = null) => {
    try {
      setSubmissionLoading(true);
      
      const response = await apiService.submitTask(taskId, textSubmission, fileUrls, comment);
      
      if (response.success) {
        setHasSubmitted(true);
        showMessage('Task submitted successfully!', 'success');
        
        // Refresh course detail to update task status
        if (selectedCourse) {
          await loadCourseDetail(selectedCourse.id);
        }
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('Error submitting task:', err);
      showMessage('Failed to submit task: ' + err.message, 'error');
    } finally {
      setSubmissionLoading(false);
    }
  };

  // Recording timer effect
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(time => time + 1);
      }, 1000);
    } else if (!isRecording && recordingTime !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording, recordingTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setHasSubmitted(false);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const submitRecording = async () => {
    if (!selectedTask) return;
    
    // Simulate file upload - in real app, you'd upload the recording file first
    const recordingUrl = `https://recordings.ycspout.rw/student_${currentUser.id}/task_${selectedTask.id}_${Date.now()}.mp4`;
    
    await handleTaskSubmission(
      selectedTask.id,
      `Recording submitted - Duration: ${formatTime(recordingTime)}`,
      [recordingUrl],
      'Recorded using YCSpout dashboard'
    );
    
    setIsRecording(false);
    setRecordingTime(0);
  };

  // Navigation
  const navigate = (view, course = null, module = null, task = null) => {
    setCurrentView(view);
    setSelectedCourse(course);
    setSelectedModule(module);
    setSelectedTask(task);
    setError(null);
    
    // Load data based on view
    if (view === 'course' && course) {
      loadCourseDetail(course.id);
    }
    
    // Reset recording states when navigating to task
    if (view === 'task') {
      setIsRecording(false);
      setRecordingTime(0);
      setHasSubmitted(false);
      setSubmissionLoading(false);
    }
  };

  const logout = () => {
    // In a real app, you would clear localStorage properly
    // localStorage.removeItem('token');
    // localStorage.removeItem('user');
    // window.location.href = '/login';
    showMessage('Logout functionality disabled in demo', 'info');
  };

  // Show message helper
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Calculate user stats from real data
  const userStats = {
    enrolledCourses: enrolledCourses.length,
    completedCourses: enrolledCourses.filter(course => course.status === 'COMPLETED').length,
    totalHours: enrolledCourses.reduce((sum, course) => {
      const estimatedHours = Math.round((course.total_videos || 5) * 0.5 * (course.progress || 0) / 100);
      return sum + estimatedHours;
    }, 0),
    averageProgress: enrolledCourses.length > 0 
      ? Math.round(enrolledCourses.reduce((sum, course) => sum + (course.progress || 0), 0) / enrolledCourses.length)
      : 0
  };

  // Error Display Component
  const ErrorDisplay = ({ message, onRetry }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // Message Notification Component
  const MessageNotification = () => {
    if (!message.text) return null;

    return (
      <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        message.type === 'success' 
          ? 'bg-green-500 text-white' 
          : message.type === 'error'
          ? 'bg-red-500 text-white'
          : 'bg-blue-500 text-white'
      }`}>
        <div className="flex items-center space-x-2">
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
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

  // Sidebar Component
  const Sidebar = () => (
    <div className={`bg-white shadow-lg transition-all duration-300 ${showSidebar ? 'w-64' : 'w-16'}`}>
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center">
            <Mic className="w-6 h-6 text-white" />
          </div>
          {showSidebar && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                YCSpout
              </h1>
              <p className="text-xs text-gray-500">Student Dashboard</p>
            </div>
          )}
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => navigate('overview')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Home className="w-5 h-5" />
            {showSidebar && <span>Overview</span>}
          </button>

          <button
            onClick={() => navigate('courses')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'courses' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            {showSidebar && <span>My Courses</span>}
          </button>

          <button
            onClick={() => navigate('assignments')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'assignments' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            {showSidebar && <span>Assignments</span>}
          </button>

          <button
            onClick={() => navigate('certificates')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'certificates' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Award className="w-5 h-5" />
            {showSidebar && <span>Certificates</span>}
          </button>
        </nav>

        {showSidebar && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{currentUser?.role}</p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Header Component
  const Header = () => (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentView === 'overview' && 'Dashboard Overview'}
              {currentView === 'courses' && 'My Courses'}
              {currentView === 'course' && (selectedCourse?.title || 'Course Details')}
              {currentView === 'assignments' && 'My Assignments'}
              {currentView === 'certificates' && 'My Certificates'}
            </h1>
            <p className="text-gray-600">
              Muraho, {currentUser?.name}! Ready to improve your speaking skills today?
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-medium text-gray-900">{currentUser?.name}</span>
          </div>
        </div>
      </div>
    </header>
  );

  // Loading Component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="text-center">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );

  // Overview Content
  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Enrolled Courses</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.enrolledCourses}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Courses</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.completedCourses}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Learning Hours</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.totalHours}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.averageProgress}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Continue Learning</h3>
        <div className="space-y-4">
          {enrolledCourses.slice(0, 3).map((course) => (
            <div key={course.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{course.title}</h4>
                <span className="text-sm text-gray-500">{course.progress || 0}%</span>
              </div>
              <div className="mb-3">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Instructor: {course.instructor_name}</span>
                <button
                  onClick={() => navigate('course', course)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Continue →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Courses Content
  const CoursesContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enrolledCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {course.status || 'ACTIVE'}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              <p className="text-sm text-gray-600 mb-4">
                Instructor: {course.instructor_name}
              </p>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{course.progress || 0}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <button
                onClick={() => navigate('course', course)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <PlayCircle className="w-5 h-5" />
                <span>Continue Learning</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Enhanced Course Content with Video Player, Comments and Tasks
  const CourseContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} onRetry={() => loadCourseDetail(selectedCourse?.id)} />;
    if (!courseDetail) return <div>Course not found</div>;

    return (
      <div className="space-y-6">
        {/* Course Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white p-6">
          <button
            onClick={() => navigate('courses')}
            className="flex items-center text-blue-100 hover:text-white mb-4"
          >
            <ChevronRight className="w-5 h-5 mr-1 rotate-180" />
            <span>Back to Courses</span>
          </button>
          
          <h1 className="text-3xl font-bold mb-2">{courseDetail.title}</h1>
          <p className="text-blue-100 mb-4">Instructor: {courseDetail.instructor_name}</p>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-blue-100">Progress:</span>
              <span className="font-semibold">{courseDetail.progress || 0}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-100">Status:</span>
              <span className="font-semibold">{courseDetail.enrollment_status}</span>
            </div>
          </div>
        </div>

        {/* Course Modules and Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative">
                <iframe
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${courseDetail.youtube_url || 'dQw4w9WgXcQ'}?rel=0&modestbranding=1`}
                  title={courseDetail.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full"
                />
              </div>
              
              {/* Video Info */}
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{courseDetail.title}</h1>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>
                      {new Date(courseDetail.created_at).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>
                
                {/* Instructor Info */}
                <div className="flex items-center justify-between py-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{courseDetail.instructor_name}</h3>
                      <p className="text-sm text-gray-600">Course Instructor</p>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{courseDetail.description}</p>
                </div>
              </div>
            </div>
            
            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Comments ({comments.length})
                </h2>
              </div>
              
              {/* Add Comment */}
              <div className="mb-6">
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div>
                      <textarea
                        name="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows="3"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={(e) => handleSubmit(e)}
                          disabled={isSubmitting || !comment.trim()}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {isSubmitting ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          <span>{isSubmitting ? 'Posting...' : 'Comment'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Comments List */}
              <div className="space-y-6">
                {Array.isArray(comments) && comments.length > 0 ? (comments.map((commentItem) => (
                  <div key={commentItem.id} className="space-y-3">
                    <div className="flex space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{commentItem.user.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{commentItem.timestamp}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">{commentItem.text}</p>
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleLikeComment(commentItem.id)}
                              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span className="text-sm">{commentItem.likes}</span>
                            </button>
                            <button
                              onClick={() => setReplyTo(replyTo === commentItem.id ? null : commentItem.id)}
                              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                        
                        {/* Reply Form */}
                        {replyTo === commentItem.id && (
                          <div className="mt-3 ml-4">
                            <div className="flex space-x-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Write a reply..."
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                  rows="2"
                                />
                                <div className="flex justify-end mt-2 space-x-2">
                                  <button
                                    onClick={() => setReplyTo(null)}
                                    className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleAddReply(commentItem.id)}
                                    disabled={!replyText.trim()}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Replies */}
                        {commentItem.replies && commentItem.replies.length > 0 && (
                          <div className="mt-4 ml-4 space-y-3">
                            {commentItem.replies.map((reply) => (
                              <div key={reply.id} className="flex space-x-2">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <h5 className="text-sm font-medium text-gray-900">{reply.user.name}</h5>
                                      <span className="text-xs text-gray-500">{reply.timestamp}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2">{reply.text}</p>
                                    <button
                                      onClick={() => handleLikeComment(reply.id, true, commentItem.id)}
                                      className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                      <ThumbsUp className="w-3 h-3" />
                                      <span className="text-xs">{reply.likes}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))): (
                  <div className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Course Progress</span>
                    <span>{courseDetail.progress || 0}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${courseDetail.progress || 0}%` }}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">
                      {courseDetail.modules?.reduce((sum, module) => sum + (module.videos?.length || 0), 0) || 1}
                    </div>
                    <div className="text-xs text-gray-600">Total Videos</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">
                      {courseDetail.modules?.reduce((sum, module) => sum + (module.tasks?.length || 0), 0) || 1}
                    </div>
                    <div className="text-xs text-gray-600">Total Tasks</div>
                  </div>
                </div>
              </div>
            </div>            
          
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleVideoComplete('demo-video')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mark as Complete
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                  Download Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Simple placeholder content for other views
  const AssignmentsContent = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">My Assignments</h2>
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Assignment overview coming soon</p>
      </div>
    </div>
  );

  const CertificatesContent = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">My Certificates</h2>
      <div className="text-center py-8 text-gray-500">
        <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Complete courses to earn certificates</p>
      </div>
    </div>
  );

  // Render current view
  const renderContent = () => {
    if (loading && currentView !== 'course') return <LoadingSpinner />;
    
    switch (currentView) {
      case 'overview':
        return <OverviewContent />;
      case 'courses':
        return <CoursesContent />;
      case 'course':
        return <CourseContent />;
      case 'assignments':
        return <AssignmentsContent />;
      case 'certificates':
        return <CertificatesContent />;
      default:
        return <OverviewContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
      
      <MessageNotification />
    </div>
  );
};

export default StudentDashboard;