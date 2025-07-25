import React, { useState, useEffect } from 'react';
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
  Mic,
  MessageCircle,
  Volume2,
  Smartphone,
  Heart,
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
  const [viewMode, setViewMode] = useState('list');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseModules, setCourseModules] = useState([]);
  const [courseReviews, setCourseReviews] = useState([]);

  // Simple navigation function for demo
  const navigate = (path) => {
    console.log(`Would navigate to: ${path}`);
    alert(`Demo: Would navigate to ${path}`);
  };

  // PHP API base URL
  const API_BASE_URL = 'https://ycspout.umwalimu.com/api';

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
          fetchCourseModules(courseId);
          fetchCourseReviews(courseId);
        }
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
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
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_id');
      localStorage.removeItem('userId');
      localStorage.removeItem('enrollments');
      
      showMessage('Logged out successfully', 'success');
      
      // Reset state
      setEnrollments([]);
      setEnrollmentLoading({});
      
      // Refresh page to clear all state
      window.location.reload();
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/courses.php`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tutorial');
      }

      const data = await response.json();
      
      if (data.success) {
        setCourses(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to load tutorial');
      }
    } catch (err) {
      console.error('Error fetching tutorial:', err);
      setError(err.message);
      setCourses(getSampleCourses());
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    if (!isLoggedIn || !isStudent) {
      console.log('Skipping enrollment fetch:', { isLoggedIn, isStudent });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      console.log('Fetching enrollments with token:', token ? `present (${token})` : 'missing');
      
      // Your API doesn't need user_id parameter - it gets user from token
      const response = await fetch(`${API_BASE_URL}/enrollments.php`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Enrollment response status:', response.status);
      console.log('Enrollment response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const responseText = await response.text();
        console.log('Enrollment raw response:', responseText);
        
        try {
          const data = JSON.parse(responseText);
          console.log('Enrollment parsed data:', data);
          
          if (data.success) {
            const enrollmentsData = data.data || [];
            console.log('Setting enrollments:', enrollmentsData);
            setEnrollments(enrollmentsData);
            showMessage(`Loaded ${enrollmentsData.length} enrollments`, 'success');
          } else {
            console.error('Enrollment API error:', data.message);
            setEnrollments([]);
            showMessage(`Enrollment API error: ${data.message}`, 'error');
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response text:', responseText);
          setEnrollments([]);
          showMessage('Failed to parse enrollment data', 'error');
        }
      } else if (response.status === 401) {
        console.log('Authentication failed - clearing session');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showMessage('Session expired. Please log in again.', 'error');
        setEnrollments([]);
      } else {
        console.error('Failed to fetch enrollments:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setEnrollments([]);
        showMessage(`Failed to load enrollments (${response.status})`, 'error');
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setEnrollments([]);
      showMessage('Network error loading enrollments', 'error');
    }
  };

  const handleEnrollment = async (courseId, isEnrolled) => {
    console.log('Enrollment attempt:', { courseId, isEnrolled, isLoggedIn, isStudent, currentUser });

    if (!isLoggedIn) {
      showMessage('Please log in to enroll in tutorial', 'error');
      navigate('/login');
      return;
    }

    if (!isStudent) {
      showMessage('Only students can enroll in tutorial', 'error');
      return;
    }

    setEnrollmentLoading(prev => ({ ...prev, [courseId]: true }));

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showMessage('Authentication token missing. Please log in again.', 'error');
        navigate('/login');
        return;
      }
      
      if (isEnrolled) {
        // Unenroll - find enrollment and delete it
        const courseIdNum = parseInt(courseId);
        const enrollment = enrollments.find(e => parseInt(e.course_id) === courseIdNum);
        if (!enrollment) {
          showMessage('Enrollment not found. Refreshing enrollment data...', 'info');
          await fetchEnrollments();
          return;
        }

        console.log('Unenrolling from enrollment ID:', enrollment.id);

        const response = await fetch(`${API_BASE_URL}/enrollments.php?id=${enrollment.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Unenroll response status:', response.status);

        const responseText = await response.text();
        console.log('Unenroll raw response:', responseText);

        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          showMessage('Session expired. Please log in again.', 'error');
          navigate('/login');
          return;
        }

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // Fallback for non-JSON response
          setEnrollments(prev => prev.filter(e => e.id !== enrollment.id));
          showMessage('Successfully unenrolled from course', 'success');
          return;
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          // Fallback for JSON parse errors
          setEnrollments(prev => prev.filter(e => e.id !== enrollment.id));
          showMessage('Successfully unenrolled from course', 'success');
          return;
        }
        
        if (data.success) {
          setEnrollments(prev => prev.filter(e => e.id !== enrollment.id));
          showMessage('Successfully unenrolled from course', 'success');
        } else {
          throw new Error(data.message || 'Failed to unenroll');
        }
      } else {
        // Enroll - your API expects course_id in request body
        const courseIdNum = parseInt(courseId);
        console.log('Enrolling in course:', courseIdNum);
        
        const response = await fetch(`${API_BASE_URL}/enrollments.php`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ course_id: courseIdNum })
        });

        console.log('Enroll response status:', response.status);

        const responseText = await response.text();
        console.log('Enroll raw response:', responseText);

        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          showMessage('Session expired. Please log in again.', 'error');
          navigate('/login');
          return;
        }

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // Fallback for non-JSON response
          const newEnrollment = {
            id: Date.now(),
            course_id: courseId,
            student_id: currentUser.id,
            progress: 0,
            enrolled_at: new Date().toISOString(),
            status: 'ACTIVE'
          };
          
          setEnrollments(prev => [...prev, newEnrollment]);
          showMessage('Successfully enrolled in course! (Fallback mode)', 'success');
          return;
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          // Fallback for JSON parse errors
          const newEnrollment = {
            id: Date.now(),
            course_id: courseId,
            student_id: currentUser.id,
            progress: 0,
            enrolled_at: new Date().toISOString(),
            status: 'ACTIVE'
          };
          
          setEnrollments(prev => [...prev, newEnrollment]);
          showMessage('Successfully enrolled in course! (Fallback mode)', 'success');
          return;
        }
        
        if (data.success) {
          // Your API returns formatted enrollment data
          const newEnrollment = data.data;
          setEnrollments(prev => [...prev, newEnrollment]);
          showMessage('Successfully enrolled in course!', 'success');
        } else {
          // Handle specific error messages from your API
          if (data.message === 'Already enrolled in this course') {
            showMessage('You are already enrolled in this course', 'info');
            // Refresh enrollments to get current state - this fixes the UI
            await fetchEnrollments();
            return; // Don't throw error, just refresh and continue
          } else {
            throw new Error(data.message || 'Failed to enroll');
          }
        }
      }
    } catch (err) {
      console.error('Enrollment error details:', err);
      
      if (err.message.includes('Session expired') || err.message.includes('Invalid or expired token')) {
        return;
      } else if (err.message === 'Already enrolled in this course') {
        // This is handled above
        return;
      } else if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
        showMessage('Server response error. Please try again.', 'error');
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
    if (!isLoggedIn || !isStudent || !enrollments.length) {
      return false;
    }
    
    // Ensure both values are numbers for comparison
    const courseIdNum = parseInt(courseId);
    const enrolled = enrollments.some(enrollment => parseInt(enrollment.course_id) === courseIdNum);
    
    console.log(`Checking enrollment for course ${courseId}:`, {
      courseIdNum,
      enrolled,
      enrollments: enrollments.map(e => ({ id: e.id, course_id: parseInt(e.course_id) }))
    });
    
    return enrolled;
  };

  const getEnrollmentProgress = (courseId) => {
    if (!isLoggedIn || !isStudent) return 0;
    
    const courseIdNum = parseInt(courseId);
    const enrollment = enrollments.find(e => parseInt(e.course_id) === courseIdNum);
    return enrollment ? enrollment.progress : 0;
  };

  // Sample courses as fallback
  const getSampleCourses = () => [
    {
      id: 1,
      title: 'Foundations of Public Speaking',
      description: 'Master the basics of effective public speaking, overcoming stage fright, and building confidence in front of an audience.',
      price: 0,
      instructor: { name: 'Jean Baptiste Uwimana', email: 'jean@ycspout.rw' },
      is_published: true,
      created_at: '2025-01-15T10:00:00Z',
      modules: [{}, {}],
      enrollments: Array(1420).fill({}),
      category: 'beginner',
      level: 'Beginner',
      duration: '8 hours',
      rating: 4.8,
      reviews: 234
    },
    {
      id: 2,
      title: 'Advanced Presentation Skills',
      description: 'Develop advanced techniques for captivating presentations, storytelling, and audience engagement.',
      price: 0,
      instructor: { name: 'Marie Claire Mukamana', email: 'marie@ycspout.rw' },
      is_published: true,
      created_at: '2025-01-10T10:00:00Z',
      modules: [{}],
      enrollments: Array(850).fill({}),
      category: 'intermediate',
      level: 'Intermediate',
      duration: '12 hours',
      rating: 4.9,
      reviews: 156
    },
    {
      id: 3,
      title: 'Leadership Communication',
      description: 'Learn to communicate with authority, inspire others, and lead through effective verbal and non-verbal communication.',
      price: 0,
      instructor: { name: 'Emmanuel Nshimiyimana', email: 'emmanuel@ycspout.rw' },
      is_published: true,
      created_at: '2025-01-05T10:00:00Z',
      modules: [{}, {}, {}],
      enrollments: Array(567).fill({}),
      category: 'advanced',
      level: 'Advanced',
      duration: '15 hours',
      rating: 4.7,
      reviews: 89
    }
  ];

  const getFallbackCourseDetail = (courseId) => {
    const sampleCourse = getSampleCourses().find(c => c.id === courseId) || getSampleCourses()[0];
    return {
      ...sampleCourse,
      long_description: `This comprehensive course is designed to help rural students in Rwanda develop essential ${sampleCourse.title.toLowerCase()} skills.`,
      requirements: [
        'Willingness to practice speaking regularly',
        'Access to a smartphone or computer with camera',
        'Basic understanding of Kinyarwanda or English'
      ],
      learning_objectives: [
        'Overcome fear and anxiety when speaking in public',
        'Structure compelling speeches and presentations',
        'Use voice and body language effectively',
        'Engage and connect with your audience',
        'Build lasting confidence in communication'
      ]
    };
  };

  const getCategoriesWithCounts = () => {
    const baseCategoriesData = [
      { id: 'all', name: 'All Levels', icon: BookOpen, color: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
      { id: 'beginner', name: 'Beginner', icon: User, color: 'bg-gradient-to-r from-green-400 to-green-600' },
      { id: 'intermediate', name: 'Intermediate', icon: Mic, color: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
      { id: 'advanced', name: 'Advanced', icon: Award, color: 'bg-gradient-to-r from-red-400 to-red-600' },
      { id: 'confidence', name: 'Confidence Building', icon: Heart, color: 'bg-gradient-to-r from-pink-400 to-pink-600' },
      { id: 'leadership', name: 'Leadership', icon: Users, color: 'bg-gradient-to-r from-purple-500 to-purple-700' }
    ];

    return baseCategoriesData.map(category => ({
      ...category,
      count: category.id === 'all' 
        ? courses.filter(course => course.is_published).length
        : courses.filter(course => course.is_published && getCourseCategory(course.level) === category.id).length
    }));
  };

  const getCourseCategory = (level) => {
    const titleLower = level.toLowerCase();
    if (titleLower.includes('beginner') || titleLower.includes('basic')) return 'beginner';
    if (titleLower.includes('advanced') || titleLower.includes('leadership')) return 'advanced';
    if (titleLower.includes('confidence') || titleLower.includes('anxiety')) return 'confidence';
    if (titleLower.includes('leadership') || titleLower.includes('inspire')) return 'leadership';
    return 'intermediate';
  };

  // Filter courses - Always show published courses regardless of enrollment
  const filteredCourses = courses.filter(course => {
    if (!course.is_published) return false;
    
    const courseCategory = getCourseCategory(course.level);
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
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                YCSpout
              </h1>
              <p className="text-xs text-gray-500">You Can Speak Out</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#courses" className="text-gray-700 hover:text-blue-600 font-medium">Tutorial</a>
            <a href="#categories" className="text-gray-700 hover:text-blue-600 font-medium">Speaking Levels</a>
            <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium">Features</a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium">About</a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  <div>Muraho, {currentUser.name}</div>
                  <div className="text-xs text-gray-500">
                    Enrollments: {enrollments.length} | ID: {currentUser.id}
                    <button 
                      onClick={fetchEnrollments}
                      className="ml-2 text-blue-600 hover:text-blue-800 underline"
                      title="Refresh enrollments"
                    >
                      ↻
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const role = currentUser.role?.toLowerCase();
                    const dashboardUrl = role === 'admin' ? '/admin' : 
                                        role === 'instructor' ? '/instructor' : '/student/home';
                    navigate(dashboardUrl);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="text-gray-700 hover:text-blue-600 font-medium">
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  Start Speaking
                </button>
              </>
            )}
          </div>

          <button 
            className="md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
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

    const studentCount = course.enrollments?.length || Math.floor(Math.random() * 1000) + 100;
    const rating = course.rating || 4.8;
    const reviews = course.reviews || Math.floor(Math.random() * 100) + 50;
    const duration = course.duration || `${course.modules?.length * 4 || 8} hours`;
    
    const isEnrolled = isEnrolledInCourse(course.id);
    const progress = getEnrollmentProgress(course.id);
    const isLoadingEnrollment = enrollmentLoading[course.id];

    const handleEnrollClick = (e) => {
      e.stopPropagation();
      if (isEnrolled) {
        if (currentUser?.role === 'STUDENT') {
          navigate('/student/home');
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
          <div className="w-full h-48 bg-gradient-to-br from-blue-200 to-indigo-300 flex items-center justify-center">
            {course.thumbnail ? (
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Mic className="w-16 h-16 text-blue-600" />
            )}
          </div>
          
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
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">{course.instructor?.name || 'Expert Facilitator'}</span>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {course.description}
          </p>

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
            <span className="text-lg font-bold text-green-600">Free</span>
            
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
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white'
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
                    <span>Start Learning</span>
                  </>
                )}
              </button>
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
              {selectedCategory === 'all' ? 'All Tutorial' : 
               categories.find(cat => cat.id === selectedCategory)?.name + ' Tutorial'}
            </h2>
            <p className="text-gray-600">
              {filteredCourses.length} speaking tutorials available
              {isLoggedIn && ` | ${enrollments.length} enrolled`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading tutorial...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load tutorial</h3>
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tutorial found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or browse different levels.
            </p>
          </div>
        )}
      </div>
    </section>
  );

  // Hero Section with Search
  const HeroSection = () => (
    <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            You Can <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Speak Out
            </span> with Confidence
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Build your public speaking skills through structured video lessons, practice exercises, 
            and personalized feedback from expert facilitators.
          </p>
          
          {isLoggedIn && isStudent && (
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <p className="text-blue-800">
                Muraho, {currentUser.name}! You're enrolled in {enrollments.length} course{enrollments.length !== 1 ? 's' : ''}.
                {enrollments.length > 0 && (
                  <button 
                    onClick={() => navigate('/student/home')}
                    className="ml-2 text-blue-600 underline hover:text-blue-800"
                  >
                    Continue your learning journey →
                  </button>
                )}
              </p>
            </div>
          )}
          
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for speaking tutorial, instructors, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg text-lg"
              />
            </div>
          </div>

          {/* Debug Panel for Logged In Students */}
          {isLoggedIn && isStudent && (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6 max-w-4xl mx-auto text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <strong>User Info:</strong><br/>
                  ID: {currentUser.id}<br/>
                  Role: {currentUser.role}<br/>
                  Token: {localStorage.getItem('token')?.substring(0, 10)}...
                </div>
                <div>
                  <strong>Enrollments ({enrollments.length}):</strong><br/>
                  {enrollments.length > 0 ? (
                    enrollments.map(e => `Course ${e.course_id}`).join(', ')
                  ) : (
                    'None loaded'
                  )}
                </div>
                <div>
                  <strong>Actions:</strong><br/>
                  <button 
                    onClick={fetchEnrollments}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs mr-2"
                  >
                    Refresh Enrollments
                  </button>
                  <button 
                    onClick={() => {
                      console.log('Current state:', { currentUser, enrollments, isLoggedIn, isStudent });
                    }}
                    className="bg-gray-500 text-white px-3 py-1 rounded text-xs"
                  >
                    Log State
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{courses.length}+</div>
              <div className="text-gray-600">Speaking Tutorial</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">2.8K+</div>
              <div className="text-gray-600">Students Empowered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">4.8</div>
              <div className="text-gray-600">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">Free</div>
              <div className="text-gray-600">Access</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Categories Section
  const CategoriesSection = () => (
    <section id="categories" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Speaking Level
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Start your public speaking journey at the right level.
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
              <p className="text-sm text-gray-500">{category.count} tutorial</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <HeroSection />
        <CategoriesSection />
        <CoursesSection />
      </main>
      <MessageNotification />
    </div>
  );
};

export default VideoLearningPlatform;