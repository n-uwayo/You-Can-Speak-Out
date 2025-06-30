import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Star, 
  Users, 
  Clock, 
  BookOpen, 
  Search, 
  Filter,
  ChevronRight,
  Award,
  Video,
  User,
  Menu,
  X,
  Code,
  Database,
  Globe,
  Smartphone,
  Palette,
  Brain,
  Loader,
  AlertTriangle,
  Check,
  ExternalLink
} from 'lucide-react';

const VideoLearningPlatform = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Course detail state
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseModules, setCourseModules] = useState([]);
  const [courseReviews, setCourseReviews] = useState([]);

  // Initialize navigate function
  const navigate = useNavigate();

  // PHP API base URL
  const API_BASE_URL = 'http://localhost/api';

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('token') && localStorage.getItem('user');
  const currentUser = isLoggedIn ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  const isStudent = currentUser?.role === 'STUDENT';

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
    if (isLoggedIn && isStudent) {
      fetchEnrollments();
    }
  }, [isLoggedIn, isStudent]);

  const fetchCourseDetails = async (courseId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/courses.php?id=${courseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedCourse(data.data);
          // Fetch course modules
          fetchCourseModules(courseId);
          fetchCourseReviews(courseId);
        }
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      // Use fallback data
      const fallbackCourse = getFallbackCourseDetail(courseId);
      setSelectedCourse(fallbackCourse);
      setCourseModules(fallbackCourse.modules || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseModules = async (courseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/modules.php?course_id=${courseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCourseModules(data.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching course modules:', err);
    }
  };

  const fetchCourseReviews = async (courseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews.php?course_id=${courseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCourseReviews(data.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching course reviews:', err);
    }
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setViewMode('detail');
    fetchCourseDetails(course.id);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCourse(null);
    setCourseModules([]);
    setCourseReviews([]);
  };

  const fetchInstructors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/instructors.php`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInstructors(data.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching instructors:', err);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Call logout API to invalidate token on server
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
      // Continue with logout even if API fails
    } finally {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('enrollments');
      
      // Show success message
      showMessage('Logged out successfully', 'success');
      
      // Redirect to login page
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/courses.php`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      
      if (data.success) {
        setCourses(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to load courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message);
      // Use sample data as fallback
      setCourses(getSampleCourses());
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    if (!isLoggedIn || !isStudent) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/enrollments.php`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEnrollments(data.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    }
  };

  const handleEnrollment = async (courseId, isEnrolled) => {
    // Debug logging
    console.log('Enrollment attempt:', { courseId, isEnrolled, isLoggedIn, isStudent, currentUser });

    if (!isLoggedIn) {
      showMessage('Please log in to enroll in courses', 'error');
      navigate('/login');
      return;
    }

    if (!isStudent) {
      showMessage('Only students can enroll in courses', 'error');
      return;
    }

    setEnrollmentLoading(prev => ({ ...prev, [courseId]: true }));

    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      // Enhanced debugging
      console.log('Auth Debug:', {
        tokenExists: !!token,
        tokenValue: token,
        tokenType: typeof token,
        userExists: !!user,
        userData: user ? JSON.parse(user) : null
      });
      
      if (isEnrolled) {
        // Unenroll - find enrollment and delete it
        const enrollment = enrollments.find(e => e.course_id === courseId);
        if (!enrollment) {
          throw new Error('Enrollment not found');
        }

        try {
          const response = await fetch(`${API_BASE_URL}/enrollments.php?id=${enrollment.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Unenroll response status:', response.status);
          console.log('Unenroll response headers:', Object.fromEntries(response.headers.entries()));
          
          // Check if response is JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('Non-JSON response:', textResponse);
            throw new Error('API_NOT_READY');
          }

          const data = await response.json();
          console.log('Unenroll response data:', data);
          
          if (response.status === 401) {
            console.error('Authentication failed - clearing localStorage and redirecting to login');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showMessage('Session expired. Please log in again.', 'error');
            navigate('/login');
            return;
          }
          
          if (data.success) {
            setEnrollments(prev => prev.filter(e => e.id !== enrollment.id));
            showMessage('Successfully unenrolled from course', 'success');
          } else {
            throw new Error(data.message || 'Failed to unenroll');
          }
        } catch (apiError) {
          if (apiError.message === 'API_NOT_READY' || apiError.name === 'SyntaxError') {
            // Fallback: Remove enrollment locally
            setEnrollments(prev => prev.filter(e => e.id !== enrollment.id));
            showMessage('Successfully unenrolled from course (demo mode)', 'success');
          } else {
            throw apiError;
          }
        }
      } else {
        // Enroll
        console.log('Attempting to enroll in course:', courseId);
        console.log('Using API URL:', `${API_BASE_URL}/enrollments.php`);
        console.log('Request headers:', {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
        console.log('Request body:', JSON.stringify({ course_id: courseId }));
        
        try {
          const response = await fetch(`${API_BASE_URL}/enrollments.php`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ course_id: courseId })
          });

          console.log('Enroll response status:', response.status);
          console.log('Enroll response headers:', Object.fromEntries(response.headers.entries()));

          // Get response text first
          const responseText = await response.text();
          console.log('Raw response:', responseText);

          // Check if response is JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.error('Non-JSON response:', responseText);
            throw new Error('API_NOT_READY');
          }

          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Response text:', responseText);
            throw new Error('API_NOT_READY');
          }
          
          console.log('Enroll response data:', data);
          
          if (response.status === 401) {
            console.error('Authentication failed - token might be invalid or expired');
            console.error('Current token:', token);
            console.error('Current user:', currentUser);
            
            // Clear invalid session
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showMessage('Session expired. Please log in again.', 'error');
            navigate('/login');
            return;
          }
          
          if (data.success) {
            const newEnrollment = data.data || {
              id: Date.now(),
              course_id: courseId,
              student_id: currentUser.id,
              progress: 0,
              enrolled_at: new Date().toISOString()
            };
            
            setEnrollments(prev => [...prev, newEnrollment]);
            showMessage('Successfully enrolled in course!', 'success');
          } else {
            throw new Error(data.message || 'Failed to enroll - please check server logs');
          }
        } catch (apiError) {
          if (apiError.message === 'API_NOT_READY' || apiError.name === 'SyntaxError' || apiError.message.includes('fetch')) {
            // Fallback: Add enrollment locally for demo purposes
            const newEnrollment = {
              id: Date.now(),
              course_id: courseId,
              student_id: currentUser.id,
              progress: 0,
              enrolled_at: new Date().toISOString(),
              status: 'ACTIVE'
            };
            
            setEnrollments(prev => [...prev, newEnrollment]);
            showMessage('Successfully enrolled in course! (Demo mode - API authentication issue)', 'success');
            console.log('Using fallback enrollment due to API error:', apiError.message);
          } else {
            throw apiError;
          }
        }
      }
    } catch (err) {
      console.error('Enrollment error details:', err);
      
      // More specific error messages
      if (err.message.includes('Session expired') || err.message.includes('Invalid or expired token')) {
        // Don't show additional error - already handled above
        return;
      } else if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
        showMessage('Server configuration error. Using demo mode for now.', 'error');
      } else if (err.message.includes('fetch')) {
        showMessage('Network error. Please check your connection and try again.', 'error');
      } else {
        showMessage(err.message || 'Enrollment failed - please try again', 'error');
      }
    } finally {
      setEnrollmentLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const isEnrolledInCourse = (courseId) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId);
  };

  const getEnrollmentProgress = (courseId) => {
    const enrollment = enrollments.find(e => e.course_id === courseId);
    return enrollment ? enrollment.progress : 0;
  };

  // Sample courses as fallback
  const getSampleCourses = () => [
    {
      id: 1,
      title: 'Complete React Developer Course',
      description: 'Master React from basics to advanced concepts including hooks, context, and testing.',
      price: 89.99,
      instructor: { name: 'Sarah Johnson', email: 'sarah@example.com' },
      is_published: true,
      created_at: '2025-01-15T10:00:00Z',
      modules: [{}, {}], // Sample modules for count
      enrollments: Array(15420).fill({}), // Sample enrollments for count
      category: 'react',
      level: 'Beginner to Advanced',
      duration: '42 hours',
      rating: 4.8,
      reviews: 2341
    },
    {
      id: 2,
      title: 'JavaScript Fundamentals & ES6+',
      description: 'Learn modern JavaScript from scratch with hands-on projects and real-world examples.',
      price: 79.99,
      instructor: { name: 'Mike Chen', email: 'mike@example.com' },
      is_published: true,
      created_at: '2025-01-10T10:00:00Z',
      modules: [{}], // Sample modules for count
      enrollments: Array(22150).fill({}), // Sample enrollments for count
      category: 'javascript',
      level: 'Beginner',
      duration: '28 hours',
      rating: 4.9,
      reviews: 3521
    },
    {
      id: 3,
      title: 'Node.js Backend Development',
      description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
      price: 94.99,
      instructor: { name: 'Alex Rodriguez', email: 'alex@example.com' },
      is_published: true,
      created_at: '2025-01-05T10:00:00Z',
      modules: [{}, {}, {}], // Sample modules for count
      enrollments: Array(11890).fill({}), // Sample enrollments for count
      category: 'nodejs',
      level: 'Intermediate',
      duration: '35 hours',
      rating: 4.7,
      reviews: 1876
    }
  ];

  // Fallback course detail data
  const getFallbackCourseDetail = (courseId) => {
    const sampleCourse = getSampleCourses().find(c => c.id === courseId) || getSampleCourses()[0];
    return {
      ...sampleCourse,
      long_description: `This comprehensive course covers everything you need to know about ${sampleCourse.title.toLowerCase()}. You'll learn through hands-on projects, real-world examples, and expert guidance.`,
      requirements: [
        'Basic understanding of HTML and CSS',
        'Familiarity with programming concepts',
        'A computer with internet connection'
      ],
      learning_objectives: [
        'Master core concepts and advanced techniques',
        'Build real-world projects from scratch',
        'Understand best practices and industry standards',
        'Gain confidence to work on professional projects'
      ],
      modules: [
        {
          id: 1,
          title: 'Getting Started',
          description: 'Introduction and setup',
          order_num: 1,
          videos: [
            { id: 1, title: 'Course Introduction', duration: '5:30', order_num: 1 },
            { id: 2, title: 'Environment Setup', duration: '12:45', order_num: 2 }
          ]
        },
        {
          id: 2,
          title: 'Core Concepts',
          description: 'Fundamental concepts and principles',
          order_num: 2,
          videos: [
            { id: 3, title: 'Basic Concepts', duration: '18:20', order_num: 1 },
            { id: 4, title: 'Advanced Topics', duration: '22:15', order_num: 2 }
          ]
        }
      ]
    };
  };

  // Categories with dynamic counts
  const getCategoriesWithCounts = () => {
    const baseCategoriesData = [
      { id: 'all', name: 'All Courses', icon: BookOpen, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
      { id: 'javascript', name: 'JavaScript', icon: Code, color: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
      { id: 'react', name: 'React', icon: Code, color: 'bg-gradient-to-r from-blue-400 to-blue-600' },
      { id: 'nodejs', name: 'Node.js', icon: Database, color: 'bg-gradient-to-r from-green-400 to-green-600' },
      { id: 'css', name: 'CSS & Design', icon: Palette, color: 'bg-gradient-to-r from-pink-400 to-red-500' },
      { id: 'database', name: 'Database', icon: Database, color: 'bg-gradient-to-r from-indigo-500 to-purple-600' }
    ];

    return baseCategoriesData.map(category => ({
      ...category,
      count: category.id === 'all' 
        ? courses.filter(course => course.is_published).length
        : courses.filter(course => course.is_published && getCourseCategory(course.title) === category.id).length
    }));
  };

  // Extract category from course title/description (simple logic)
  const getCourseCategory = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('react')) return 'react';
    if (titleLower.includes('javascript') || titleLower.includes('js')) return 'javascript';
    if (titleLower.includes('node')) return 'nodejs';
    if (titleLower.includes('css') || titleLower.includes('design')) return 'css';
    if (titleLower.includes('database') || titleLower.includes('sql')) return 'database';
    return 'javascript'; // default category
  };

  // Filter courses based on category and search
  const filteredCourses = courses.filter(course => {
    if (!course.is_published) return false;
    
    const courseCategory = getCourseCategory(course.title);
    const matchesCategory = selectedCategory === 'all' || courseCategory === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = getCategoriesWithCounts();

  // Header Component
  const Header = () => (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduPlatform
              </h1>
              <p className="text-xs text-gray-500">Learning Management System</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#courses" className="text-gray-700 hover:text-blue-600 font-medium">Courses</a>
            <a href="#categories" className="text-gray-700 hover:text-blue-600 font-medium">Categories</a>
            <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium">Features</a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium">About</a>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Welcome, {currentUser.name}</span>
                <button 
                  onClick={() => {
                    const role = currentUser.role?.toLowerCase();
                    const dashboardUrl = role === 'admin' ? '/admin' : 
                                        role === 'instructor' ? '/instructor' : '/dashboard';
                    navigate(dashboardUrl);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="text-gray-700 hover:text-blue-600 font-medium">
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              <a href="#courses" className="text-gray-700 hover:text-blue-600 font-medium">Courses</a>
              <a href="#categories" className="text-gray-700 hover:text-blue-600 font-medium">Categories</a>
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium">Features</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium">About</a>
              <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200">
                {isLoggedIn ? (
                  <>
                    <span className="text-sm text-gray-700">Welcome, {currentUser.name}</span>
                    <button 
                      onClick={() => {
                        const role = currentUser.role?.toLowerCase();
                        const dashboardUrl = role === 'admin' ? '/admin' : 
                                            role === 'instructor' ? '/instructor' : '/dashboard';
                        navigate(dashboardUrl);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-left"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-left flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => navigate('/login')} className="text-gray-700 hover:text-blue-600 font-medium text-left">
                      Sign In
                    </button>
                    <button 
                      onClick={() => navigate('/login')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-left"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );

  // Message Notification Component
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
            <Check className="w-5 h-5" />
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

  // Hero Section
  const HeroSection = () => {
    const totalStudents = courses.reduce((sum, course) => sum + (course.enrollments?.length || 0), 0);
    const averageRating = courses.length > 0 
      ? (courses.reduce((sum, course) => sum + (course.rating || 4.8), 0) / courses.length).toFixed(1)
      : '4.8';

    return (
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Master <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Programming
              </span> with Expert-Led Courses
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Learn coding skills through high-quality video courses, hands-on projects, 
              and assignments designed by industry experts.
            </p>
            
            {/* User-specific message */}
            {isLoggedIn && isStudent && (
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
                <p className="text-blue-800">
                  Welcome back, {currentUser.name}! You're enrolled in {enrollments.length} course{enrollments.length !== 1 ? 's' : ''}.
                  {enrollments.length > 0 && (
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="ml-2 text-blue-600 underline hover:text-blue-800"
                    >
                      Continue learning →
                    </button>
                  )}
                </p>
              </div>
            )}
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for courses, instructors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg text-lg"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{courses.length}+</div>
                <div className="text-gray-600">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{totalStudents > 0 ? `${Math.floor(totalStudents/1000)}K+` : '50K+'}</div>
                <div className="text-gray-600">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{averageRating}</div>
                <div className="text-gray-600">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{isStudent ? enrollments.length : '24/7'}</div>
                <div className="text-gray-600">{isStudent ? 'Enrolled' : 'Support'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Categories Section
  const CategoriesSection = () => (
    <section id="categories" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from our wide range of programming courses designed to take you from beginner to expert.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category.id
                  ? 'ring-4 ring-blue-200 shadow-xl'
                  : 'hover:shadow-lg'
              }`}
            >
              <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <category.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.count} courses</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );

  // Course Card Component
  const CourseCard = ({ course }) => {
    const renderStars = (rating) => {
      return [...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
        />
      ));
    };

    const studentCount = course.enrollments?.length || Math.floor(Math.random() * 10000) + 1000;
    const rating = course.rating || 4.8;
    const reviews = course.reviews || Math.floor(Math.random() * 1000) + 100;
    const duration = course.duration || `${course.modules?.length * 8 || 20} hours`;
    
    const isEnrolled = isEnrolledInCourse(course.id);
    const progress = getEnrollmentProgress(course.id);
    const isLoadingEnrollment = enrollmentLoading[course.id];

    const handleEnrollClick = (e) => {
      e.stopPropagation();
      if (isEnrolled) {
        // Redirect to course content or dashboard
        if (currentUser?.role === 'STUDENT') {
          navigate('/dashboard');
        }
      } else {
        handleEnrollment(course.id, false);
      }
    };

    const handleUnenrollClick = (e) => {
      e.stopPropagation();
      if (window.confirm('Are you sure you want to unenroll from this course?')) {
        handleEnrollment(course.id, true);
      }
    };

    return (
      <div 
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer"
        onClick={() => handleCourseClick(course)}
      >
        <div className="relative">
          <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            {course.thumbnail ? (
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Video className="w-16 h-16 text-gray-400" />
            )}
          </div>
          
          {/* Enrollment Status Badge */}
          {isEnrolled && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
              <Check className="w-3 h-3 mr-1" />
              Enrolled
            </div>
          )}
          
          <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-lg">
            <span className="text-xs font-medium text-gray-700">{course.level || 'All Levels'}</span>
          </div>
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-lg">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{duration}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>
          
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-gray-600" />
            </div>
            <span className="text-sm text-gray-600">{course.instructor?.name || 'Expert Instructor'}</span>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {course.description}
          </p>

          {/* Progress Bar for Enrolled Courses */}
          {isEnrolled && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="flex">{renderStars(rating)}</div>
              <span className="text-sm font-medium text-gray-900">{rating}</span>
              <span className="text-xs text-gray-500">({reviews})</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{studentCount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* <span className="text-2xl font-bold text-blue-600">
              {course.price && course.price > 0 ? `$${course.price}` : 'Free'}
            </span> */}
            
            <div className="flex items-center space-x-2">
              {isEnrolled && (
                <button 
                  onClick={handleUnenrollClick}
                  disabled={isLoadingEnrollment}
                  className="text-red-600 hover:text-red-800 px-3 py-2 rounded-lg border border-red-300 hover:bg-red-50 transition-all text-sm disabled:opacity-50"
                >
                  Unenroll
                </button>
              )}
              
              <button 
                onClick={handleEnrollClick}
                disabled={isLoadingEnrollment}
                className={`px-6 py-2 rounded-lg transition-all flex items-center space-x-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                  isEnrolled 
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg text-white'
                }`}
              >
                {isLoadingEnrollment ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : isEnrolled ? (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    <span>Continue</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Enroll Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Course Detail Content Component
  const CourseDetailContent = () => {
    if (!selectedCourse) return null;

    const isEnrolled = isEnrolledInCourse(selectedCourse.id);
    const progress = getEnrollmentProgress(selectedCourse.id);
    const isLoadingEnrollment = enrollmentLoading[selectedCourse.id];

    const handleEnrollClick = () => {
      if (isEnrolled) {
        if (currentUser?.role === 'STUDENT') {
          navigate('/dashboard');
        }
      } else {
        handleEnrollment(selectedCourse.id, false);
      }
    };

    const renderStars = (rating) => {
      return [...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
        />
      ));
    };

    const totalVideos = courseModules.reduce((total, module) => total + (module.videos?.length || 0), 0);
    const studentCount = selectedCourse.enrollments?.length || Math.floor(Math.random() * 10000) + 1000;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Hero */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-8">
              <div className="mb-6">
                <div className="flex items-center space-x-2 text-blue-100 mb-4">
                  <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                    {selectedCourse.level || 'All Levels'}
                  </span>
                  <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                    {selectedCourse.duration || '20 hours'}
                  </span>
                </div>
                <h1 className="text-4xl font-bold mb-4">{selectedCourse.title}</h1>
                <p className="text-xl text-blue-100 mb-6">
                  {selectedCourse.long_description || selectedCourse.description}
                </p>
              </div>

              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  <span>{selectedCourse.instructor?.name || 'Expert Instructor'}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  <span>{studentCount.toLocaleString()} students</span>
                </div>
                <div className="flex items-center">
                  <div className="flex mr-2">{renderStars(selectedCourse.rating || 4.8)}</div>
                  <span>{selectedCourse.rating || 4.8} ({selectedCourse.reviews || 100} reviews)</span>
                </div>
              </div>

              {isEnrolled && (
                <div className="mt-6 bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Your Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full h-3">
                    <div
                      className="bg-white h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
              
              {courseModules.length > 0 ? (
                <div className="space-y-4">
                  {courseModules.map((module, index) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg">
                      <div className="p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Module {index + 1}: {module.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {module.videos?.length || 0} videos
                          </div>
                        </div>
                      </div>
                      
                      {module.videos && module.videos.length > 0 && (
                        <div className="p-4 space-y-2">
                          {module.videos.map((video) => (
                            <div key={video.id} className="flex items-center space-x-3 text-sm">
                              <Play className="w-4 h-4 text-gray-400" />
                              <span className="flex-1">{video.title}</span>
                              <span className="text-gray-500">{video.duration}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Course content will be available after enrollment</p>
                </div>
              )}
            </div>

            {/* Learning Objectives */}
            {selectedCourse.learning_objectives && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCourse.learning_objectives.map((objective, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {selectedCourse.requirements && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h2>
                <ul className="space-y-2">
                  {selectedCourse.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center mb-6">
                  {selectedCourse.thumbnail ? (
                    <img 
                      src={selectedCourse.thumbnail} 
                      alt={selectedCourse.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Play className="w-16 h-16 text-gray-400" />
                  )}
                </div>

                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {selectedCourse.price && selectedCourse.price > 0 ? `$${selectedCourse.price}` : 'Free'}
                  </div>
                  {selectedCourse.price && selectedCourse.price > 0 && (
                    <div className="text-sm text-gray-500">One-time payment</div>
                  )}
                </div>

                <button
                  onClick={handleEnrollClick}
                  disabled={isLoadingEnrollment}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isEnrolled 
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg text-white'
                  }`}
                >
                  {isLoadingEnrollment ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : isEnrolled ? (
                    <>
                      <ExternalLink className="w-5 h-5" />
                      <span>Go to Course</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Enroll Now</span>
                    </>
                  )}
                </button>

                {isEnrolled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to unenroll from this course?')) {
                        handleEnrollment(selectedCourse.id, true);
                      }
                    }}
                    className="w-full mt-3 py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all text-sm"
                  >
                    Unenroll from Course
                  </button>
                )}

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex items-center space-x-3">
                    <Video className="w-5 h-5 text-gray-400" />
                    <span>{totalVideos} video lectures</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span>{selectedCourse.duration || '20 hours'} total duration</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-gray-400" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span>Lifetime access</span>
                  </div>
                </div>
              </div>

              
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Courses Section
  const CoursesSection = () => (
    <section id="courses" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedCategory === 'all' ? 'All Courses' : 
               categories.find(cat => cat.id === selectedCategory)?.name + ' Courses'}
            </h2>
            <p className="text-gray-600">
              {filteredCourses.length} courses found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading courses...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load courses</h3>
            <p className="text-gray-600 mb-4">Using sample data for demonstration</p>
            <button 
              onClick={fetchCourses}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {!loading && !error && filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or browse different categories.
            </p>
          </div>
        )}
      </div>
    </section>
  );

  // Features Section
  const FeaturesSection = () => (
    <section id="features" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose EduPlatform?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We provide the best learning experience with cutting-edge features and expert support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">HD Video Content</h3>
            <p className="text-gray-600">
              High-quality video lessons with interactive assignments and downloadable resources.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Complete assignments, track your progress, and get feedback from instructors.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Instructors</h3>
            <p className="text-gray-600">
              Learn from industry professionals with real-world experience and proven expertise.
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  // Footer
  const Footer = () => (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">EduPlatform</span>
            </div>
            <p className="text-gray-400">
              Empowering developers worldwide with high-quality courses, assignments, and hands-on learning experiences.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Courses</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">JavaScript</a></li>
              <li><a href="#" className="hover:text-white">React</a></li>
              <li><a href="#" className="hover:text-white">Node.js</a></li>
              <li><a href="#" className="hover:text-white">Database</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => navigate('/login')} className="hover:text-white">Sign In</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-white">Create Account</button></li>
              <li><a href="#" className="hover:text-white">Student Portal</a></li>
              <li><a href="#" className="hover:text-white">Instructor Portal</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 EduPlatform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {viewMode === 'detail' ? (
        <>
          {/* Header with Back Button */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <button
                onClick={handleBackToList}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5 mr-1 rotate-180" />
                <span>Back to Courses</span>
              </button>
            </div>
          </div>
          <CourseDetailContent />
        </>
      ) : (
        <>
          <HeroSection />
          <CategoriesSection />
          <CoursesSection />
          <FeaturesSection />
          <Footer />
        </>
      )}
      <MessageNotification />
    </div>
  );
};

export default VideoLearningPlatform;