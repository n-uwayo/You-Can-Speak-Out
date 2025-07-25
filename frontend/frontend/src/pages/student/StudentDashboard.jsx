import React, { useState, useEffect, useCallback, useRef } from 'react';
import AssignmentUpload from './AssignmentUpload'; 
import AssignmentsContent from './AssignmentsContent'; 
import TasksContent  from './AtaskContent'; 
import { Link, useNavigate } from 'react-router-dom';
import { CertificatesContent, CertificateGenerationButton, certificateService } from './CertificateComponents';

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

// API Service - Fixed URL to match your domain
const API_BASE_URL = 'https://ycspout.umwalimu.com/api'; // Fixed: Added the extra 's'

const apiService = {
  // Get authorization headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  },

  // Certificate methods
  async getCertificates() {
    return await certificateService.getCertificates();
  },

  async generateCertificate(courseId) {
    return await certificateService.generateCertificate(courseId);
  },

  async checkCourseCompletion(courseId) {
    return await certificateService.checkCompletion(courseId);
  },

  // Fixed: Removed duplicate saveProgress method
  async saveProgress(courseId) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(`${API_BASE_URL}/student/saveProgress.php`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          course_id: courseId,
          user_id: currentUser.id,
          timestamp: Date.now()
        }),
      });
      
      const result = await response.json();
      
      // Check if course is completed and show certificate option
      if (result.success && result.progress >= 100) {
        // Auto-check if certificate can be generated
        this.checkCourseCompletion(courseId);
      }
      
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get all courses (student will see only enrolled ones based on backend logic)
  async getEnrolledCourses() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      const response = await fetch(`${API_BASE_URL}/courses.php?student_idx=${currentUser.id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch tutorials');
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching enrolled tutorials:', error);
      throw error;
    }
  },

  // Get course details with modules and enrollment info
  async getCourseDetail(courseId) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      const response = await fetch(`${API_BASE_URL}/student/course.php?course_id=${courseId}&student_idx=${currentUser.id}`, {
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
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      const response = await fetch(`${API_BASE_URL}/student/progress.php`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          action: 'update_video_progress',
          video_id: videoId,
          user_id: currentUser?.id,
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

  async submitReply(replyText, parentId, courseId) {
    try {
      const response = await fetch(`${API_BASE_URL}/student/comment.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ 
          comment: replyText,
          courseId: courseId,
          parent_id: parentId
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const message = result?.message || "Failed to submit reply.";
        throw new Error(message);
      }

      return result.data;
    } catch (error) {
      console.error("Error submitting reply:", error.message);
      throw error;
    }
  },

  // Submit comment
  async submitComment(comment, courseId) {
    try {
      const response = await fetch(`${API_BASE_URL}/student/comment.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ 
          comment,
          courseId: courseId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const message = result?.message || "Failed to submit comment.";
        throw new Error(message);
      }

      return result.data;
    } catch (error) {
      console.error("Error submitting comment:", error.message);
      throw error;
    }
  },

  // Get user profile
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token') && !!localStorage.getItem('user');
  }
};

const CommentInputBox = ({ onSubmit, isSubmitting }) => {
  const [localComment, setLocalComment] = useState('');

  const handleSubmit = async () => {
    if (!localComment.trim() || isSubmitting) return;
    
    await onSubmit(localComment);
    setLocalComment(''); // Clear after submit
  };

  return (
    <div className="mb-6">
      <div className="flex space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <textarea
            value={localComment}
            onChange={(e) => setLocalComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Add a comment..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="3"
            disabled={isSubmitting}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !localComment.trim()}
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
  );
};

const StudentDashboard = () => {
  const navigate2 = useNavigate();
  const currentUser2 = JSON.parse(localStorage.getItem('user')) || {};
  const displayName = currentUser2.name || 'Admin User N';
  
  // Redirect if not authenticated
  useEffect(() => {
    if (displayName === "Admin User N" || !apiService.isAuthenticated()) {
      navigate2('/login', { replace: true });
    }
  }, [displayName, navigate2]);

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
  const [certificateStats, setCertificateStats] = useState({ total: 0, thisYear: 0 });
  
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  
  // Video comment states
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Get current user
  const currentUser = apiService.getCurrentUser() || {
    id: 4,
    name: 'Student User',
    email: 'student@example.com',
    role: 'STUDENT'
  };

  // Show message helper
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleSubmitComment = async (commentText) => {
    const currentCourseId = courseDetail?.id;
    
    if (!commentText || !currentCourseId) return;

    setIsSubmitting(true);

    try {
      await apiService.submitComment(commentText, currentCourseId);
      
      const newCommentObj = {
        id: Date.now(),
        text: commentText,
        courseId: currentCourseId,
        user: { name: currentUser.name },
        timestamp: 'Just now',
        likes: 0,
        replies: []
      };
      
      setComments(prev => [newCommentObj, ...prev]);
      showMessage('Comment submitted successfully!', 'success');
      
    } catch (error) {
      console.error("Error:", error);
      showMessage('Failed to submit comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [currentCourseId, setCurrentCourseId] = useState(null);

  // Load comments function
  const loadComments = useCallback(async (videoId = null, courseId = null) => {
    if (!courseId) return;
    
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
  }, []);

  // Load comments when course changes
  useEffect(() => {
    if (currentView === 'course' && courseDetail?.id && courseDetail.id !== currentCourseId) {
      setCurrentCourseId(courseDetail.id);
      loadComments(null, courseDetail.id);
    }
  }, [currentView, courseDetail?.id, currentCourseId, loadComments]);

  // Load certificate stats
  useEffect(() => {
    const loadCertificateStats = async () => {
      try {
        const result = await certificateService.getCertificates();
        if (result.success) {
          const certificates = result.data || [];
          const thisYear = certificates.filter(cert => 
            new Date(cert.issued_date).getFullYear() === new Date().getFullYear()
          ).length;
          
          setCertificateStats({
            total: certificates.length,
            thisYear: thisYear
          });
        }
      } catch (error) {
        console.error('Error loading certificate stats:', error);
      }
    };

    if (currentView === 'overview') {
      loadCertificateStats();
    }
  }, [currentView]);

  // Load enrolled courses
  const loadEnrolledCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getEnrolledCourses();
      
      if (response.success) {
        const courses = Array.isArray(response.data) ? response.data : [];
        
        const transformedCourses = courses.map(course => ({
          ...course,
          instructor_name: course.instructor?.name || 'Unknown Instructor',
          progress: course.progress,
          total_videos: course.modules?.length || 0,
          status: course.is_published ? 'ACTIVE' : 'INACTIVE',
          enrolled_at: course.created_at || new Date().toISOString()
        }));
        
        setEnrolledCourses(transformedCourses);
      } else {
        throw new Error(response.message || 'Failed to load tutorials');
      }
    } catch (err) {
      console.error('Error loading tutorials:', err);
      setError(err.message);
      setEnrolledCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized handlers
  const handleCommentChange = useCallback((e) => {
    setComment(e.target.value);
  }, []);

  const handleReplyTextChange = useCallback((e) => {
    setReplyText(e.target.value);
  }, []);

  // Handle comment submission with Enter key support
  const handleCommentKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [comment, courseDetail]);

  // Handle comment submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault(); 
    const trimmedComment = comment.trim();
    if (!trimmedComment || !courseDetail?.id) return;

    setIsSubmitting(true);

    try {
      await apiService.submitComment(trimmedComment, courseDetail.id);
      
      const newCommentObj = {
        id: Date.now(),
        text: trimmedComment,
        courseId: courseDetail.id,
        user: { name: currentUser.name },
        timestamp: 'Just now',
        likes: 0,
        replies: []
      };
      
      setComments(prev => [newCommentObj, ...prev]);
      setComment("");
      showMessage('Comment submitted successfully!', 'success');
      
    } catch (error) {
      console.error("Error:", error);
      showMessage('Failed to submit comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [comment, courseDetail?.id, currentUser.name]);

  // Handle add reply
  const handleAddReply = useCallback(async (commentId) => {
    const trimmedReply = replyText.trim();
    if (!trimmedReply || !courseDetail?.id) return;

    setIsSubmitting(true);

    try {
      const result = await apiService.submitReply(trimmedReply, commentId, courseDetail.id);
      
      const newReply = {
        id: result?.id || Date.now(),
        text: trimmedReply,
        user: { name: currentUser.name },
        timestamp: 'Just now',
        likes: 0
      };
      
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      }));
      
      setReplyText('');
      setReplyTo(null);
      showMessage('Reply submitted successfully!', 'success');
      
    } catch (error) {
      console.error("Error:", error);
      showMessage('Failed to submit reply', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [replyText, courseDetail?.id, currentUser.name]);

  // Handle like comment
  const handleLikeComment = (commentId, isReply = false, parentId = null) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, likes: (comment.likes || 0) + 1 };
      }
      if (isReply && comment.id === parentId) {
        return {
          ...comment,
          replies: comment.replies?.map(reply => 
            reply.id === commentId 
              ? { ...reply, likes: (reply.likes || 0) + 1 }
              : reply
          ) || []
        };
      }
      return comment;
    }));
  };

  // Initial load
  useEffect(() => {
    loadEnrolledCourses();
  }, [loadEnrolledCourses]);

  // Load course detail
  const loadCourseDetail = async (courseId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getCourseDetail(courseId);
      
      if (response.success) {
        const course = response.data;
        
        const transformedCourse = {
          ...course,
          instructor_name: course.instructor?.name || 'Unknown Instructor',
          progress: course.progress,
          enrollment_status: course.is_published ? 'ACTIVE' : 'INACTIVE',
          modules: course.modules?.map(module => ({
            ...module,
            is_completed: Math.random() > 0.5,
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
        
        if (selectedCourse) {
          await loadCourseDetail(selectedCourse.id);
        }
        
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
    
    if (view === 'course' && course) {
      loadCourseDetail(course.id);
    }
    
    if (view === 'task') {
      setIsRecording(false);
      setRecordingTime(0);
      setHasSubmitted(false);
      setSubmissionLoading(false);
    }
  };

  const logout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        await fetch(`${API_BASE_URL}/auth.php?action=logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('enrollments');
      
      showMessage('Logged out successfully', 'success');
      navigate2('/login');
    }
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

  // Fixed: Sidebar Component with proper certificate menu
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
            onClick={() => window.location.href = '/'}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === '/' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Home className="w-5 h-5" />
            {showSidebar && <span>Home</span>}
          </button>
          
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
            {showSidebar && <span>My Tutorials</span>}
          </button>

          <button
            onClick={() => navigate('tasks')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'tasks' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            {showSidebar && <span>Tasks</span>}
          </button>

          <button
            onClick={() => navigate('assignments')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'assignments' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            {showSidebar && <span>Assignments Submitted</span>}
          </button>

          {/* Fixed: Proper certificate menu button */}
          <button
            onClick={() => navigate('certificates')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'certificates' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Award className="w-5 h-5" />
            {showSidebar && <span>My Certificates</span>}
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
              {currentView === 'courses' && 'My Learning'}
              {currentView === 'course' && (selectedCourse?.title || 'Course Details')}
              {currentView === 'assignments' && 'My Assignments'}
              {currentView === 'certificates' && 'My Certificates'}
              {currentView === 'tasks' && 'My Tasks'}
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

  // Overview Content with Certificate Stats
  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Enrolled Tutorials</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.enrolledCourses}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certificates Earned</p>
              <p className="text-2xl font-bold text-gray-900">{certificateStats.total}</p>
            </div>
            <Award className="w-8 h-8 text-green-600" />
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
              <p className="text-sm text-gray-600">This Year</p>
              <p className="text-2xl font-bold text-gray-900">{certificateStats.thisYear}</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-600" />
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
                <span>Start Learning</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Enhanced Course Content with Certificate Generation
  const CourseContent = () => {
    const autoSaveInterval = useRef(null);
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} onRetry={() => loadCourseDetail(selectedCourse?.id)} />;
    if (!courseDetail) return <div>Tutorial not found</div>;

    // Auto-save every 5 seconds
    useEffect(() => {
      if (!courseDetail?.id) return;

      const saveProgress = async () => {
        await apiService.saveProgress(courseDetail.id);
      };

      saveProgress();
      autoSaveInterval.current = setInterval(saveProgress, 5000);

      return () => {
        if (autoSaveInterval.current) {
          clearInterval(autoSaveInterval.current);
          autoSaveInterval.current = null;
        }
      };
    }, [courseDetail?.id]);

    return (
      <div className="space-y-6">
        {/* Course Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white p-6">
          <button
            onClick={() => navigate('courses')}
            className="flex items-center text-blue-100 hover:text-white mb-4"
          >
            <ChevronRight className="w-5 h-5 mr-1 rotate-180" />
            <span>Back to Tutorial</span>
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
              
              <CommentInputBox 
                onSubmit={handleSubmitComment}
                isSubmitting={isSubmitting}
              />
              
              {/* Comments List */}
              <div className="space-y-6">
                {commentsLoading ? (
                  <div className="text-center py-4">
                    <Loader className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                    <p className="text-gray-500 mt-2">Loading comments...</p>
                  </div>
                ) : Array.isArray(comments) && comments.length > 0 ? (
                  comments.map((commentItem) => (
                    <div key={commentItem.id} className="space-y-3">
                      <div className="flex space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{commentItem.user?.name || 'Anonymous'}</h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>{commentItem.timestamp || 'Just now'}</span>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{commentItem.text}</p>
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => handleLikeComment(commentItem.id)}
                                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span className="text-sm">{commentItem.likes || 0}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setReplyTo(replyTo === commentItem.id ? null : commentItem.id);
                                  setReplyText('');
                                }}
                                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                          
                          {/* Reply Section */}
                          {replyTo === commentItem.id && (
                            <div className="mt-3 ml-4">
                              <div className="flex space-x-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <textarea
                                    value={replyText}
                                    onChange={handleReplyTextChange}
                                    placeholder="Write a reply..."
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows="2"
                                    disabled={isSubmitting}
                                  />
                                  <div className="flex justify-end mt-2 space-x-2">
                                    <button
                                      onClick={() => {
                                        setReplyTo(null);
                                        setReplyText('');
                                      }}
                                      className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1"
                                      disabled={isSubmitting}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleAddReply(commentItem.id)}
                                      disabled={!replyText.trim() || isSubmitting}
                                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
                                    >
                                      {isSubmitting ? (
                                        <Loader className="w-3 h-3 animate-spin" />
                                      ) : null}
                                      <span>{isSubmitting ? 'Submitting...' : 'Reply'}</span>
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
                                        <h5 className="text-sm font-medium text-gray-900">{reply.user?.name || 'Anonymous'}</h5>
                                        <span className="text-xs text-gray-500">{reply.timestamp || 'Just now'}</span>
                                      </div>
                                      <p className="text-sm text-gray-700 mb-2">{reply.text}</p>
                                      <button
                                        onClick={() => handleLikeComment(reply.id, true, commentItem.id)}
                                        className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                                      >
                                        <ThumbsUp className="w-3 h-3" />
                                        <span className="text-xs">{reply.likes || 0}</span>
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
                  ))
                ) : (
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

            {/* Certificate Generation Section */}
            {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Certificate</span>
              </h3>
              <CertificateGenerationButton 
                course={courseDetail} 
                onGenerate={(certificate) => {
                  showMessage('Certificate generated successfully!', 'success');
                }}
              />
            </div> */}
          
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowUploadPopup(true)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Have a task?
                </button>

                {showUploadPopup && (
                  <AssignmentUpload userId={currentUser?.id} courseId={courseDetail.id} onClose={() => setShowUploadPopup(false)} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // Simple placeholder content for other views
  const AssignmentsContentlink = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <AssignmentsContent userId={currentUser.id} />
    </div>
  );

  const TaskContentlink = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <TasksContent userId={currentUser.id} />
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
        return <AssignmentsContentlink />;
      case 'certificates':
        return <CertificatesContent />;
      case 'tasks':
        return <TaskContentlink />;
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