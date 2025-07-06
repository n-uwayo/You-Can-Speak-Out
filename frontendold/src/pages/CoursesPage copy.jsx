import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Clock, 
  BookOpen, 
  Star, 
  Filter,
  RefreshCw,
  Loader,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  User,
  Save,
  X
} from 'lucide-react';

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    thumbnail: '',
    video_url:'',
    instructor_id: '', // Changed to snake_case for PHP
    is_published: false // Changed to snake_case for PHP
  });

  // PHP API base URL - update this to match your setup
  const API_BASE_URL = 'http://localhost/api'; // Change this to your PHP API folder path

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  // Fetch courses from PHP API
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/courses.php`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to view courses.');
        } else {
          throw new Error(`Failed to fetch courses: ${response.status}`);
        }
      }

      const data = await response.json();
      
      // Handle different PHP response formats
      if (data.success) {
        setCourses(data.data || data.courses || []);
      } else {
        throw new Error(data.message || 'Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert(error.message || 'Failed to load courses. Please try again.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch instructors from PHP API
  const fetchInstructors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/instructors.php`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInstructors(data.data || data.instructors || []);
        } else {
          console.error('Failed to fetch instructors:', data.message);
          setInstructors([]);
        }
      } else {
        console.error('Failed to fetch instructors');
        setInstructors([]);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setInstructors([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.instructor_id) {
      alert('Please fill in all required fields (Title, Description, and Instructor)');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price) || 0,
        thumbnail: formData.thumbnail.trim() || null,        
        video_url: formData.video_url.trim() || null, 
        instructor_id: formData.instructor_id,
        is_published: formData.is_published
      };

      // For PHP APIs, we often use the same endpoint with different methods
      // or separate create/update endpoints
      const url = editingCourse 
        ? `${API_BASE_URL}/courses.php?id=${editingCourse.id}`
        : `${API_BASE_URL}/courses.php`;
      
      const method = editingCourse ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        throw new Error(`${method} failed with status ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert(editingCourse ? 'Course updated successfully!' : 'Course created successfully!');
        handleCloseModal();
        fetchCourses(); // Refresh courses list
      } else {
        throw new Error(result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(error.message || 'Failed to save course. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      price: course.price?.toString() || '',
      thumbnail: course.thumbnail || '',
      video_url: course.youtube_url || '',
      instructor_id: course.instructor_id || course.instructor?.id || '',
      is_published: course.is_published || false
    });
    setShowModal(true);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This will also delete all modules, videos, and enrollments.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/courses.php?id=${courseId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Delete failed with status ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          alert('Course deleted successfully!');
          fetchCourses(); // Refresh courses list
        } else {
          throw new Error(result.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert(error.message || 'Failed to delete course. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      thumbnail: '',
      video_url:'',
      instructor_id: '',
      is_published: false
    });
    setEditingCourse(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleRefresh = () => {
    fetchCourses();
    fetchInstructors();
  };

  // Helper functions
  const getStatusDisplay = (isPublished) => {
    return isPublished ? 'Published' : 'Draft';
  };

  const getStatusColor = (isPublished) => {
    return isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStudentCount = (enrollments) => {
    return enrollments?.length || 0;
  };

  const getModuleCount = (modules) => {
    return modules?.length || 0;
  };

  const getInstructorName = (instructor) => {
    return instructor?.name || 'Unknown Instructor';
  };

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'published' && course.is_published) ||
                         (selectedStatus === 'draft' && !course.is_published);
    
    return matchesSearch && matchesStatus;
  });

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          {course.thumbnail ? (
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen className="w-16 h-16 text-white opacity-80" />
          )}
        </div>
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
          {course.duration || 0}
        </div>
        <div className="absolute top-2 left-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.is_published)}`}>
            {getStatusDisplay(course.is_published)}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-lg leading-tight">
          {course.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-1" />
            <span>{getInstructorName(course.instructor)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
          
          <div className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            {getStudentCount(course.enrollments)} students
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(course.created_at)}
          </div>
          <div className="flex items-center">
            <BookOpen className="w-3 h-3 mr-1" />
            {course.duration || '0'}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleEdit(course)}
            className="text-gray-600 hover:text-gray-800 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(course.id)}
            className="text-red-600 hover:text-red-800 p-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading tutorial...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tutorial Management</h1>
        <p className="text-gray-600 mt-2">Create and manage your educational courses</p>
        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
          <span>{courses.length} total courses</span>
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
            {courses.filter(c => c.is_published).length} published
          </span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tutorials, instructors, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full md:w-80"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 text-sm ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
              >
                List
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </button>
          </div>
        </div>
      </div>

      {/* Courses Grid/List */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
          <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchTerm || selectedStatus !== 'all' ? 'No courses match your search' : 'No courses yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedStatus !== 'all' 
              ? 'Try adjusting your search terms or filters' 
              : 'Create your first course to get started'
            }
          </p>
          {(!searchTerm && selectedStatus === 'all') && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2 inline" />
              Create Your First Course
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutorial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modules
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center mr-4">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{course.title}</div>
                          <div className="text-sm text-gray-500">{formatDate(course.created_at)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getInstructorName(course.instructor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getStudentCount(course.enrollments)}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getModuleCount(course.modules)}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${course.price || 'Free'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.is_published)}`}>
                        {getStatusDisplay(course.is_published)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(course)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(course.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </h2>
            
            <div className="space-y-5">
              {/* Course Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="Enter course title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  rows="4"
                  required
                  placeholder="Describe what students will learn in this course..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Instructor and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructor *
                  </label>
                  <select
                    name="instructor_id"
                    value={formData.instructor_id}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select instructor</option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.name} ({instructor.email})
                      </option>
                    ))}
                  </select>
                  {instructors.length === 0 && (
                    <p className="text-sm text-amber-600 mt-1 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      No instructors found. Create instructor users first.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail URL
                </label>
                <input
                  name="thumbnail"
                  type="url"
                  placeholder="https://example.com/thumbnail.jpg"
                  value={formData.thumbnail}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>


              {/* Thumbnail URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL
                </label>
                <input
                  name="video_url"
                  type="url"
                  placeholder="https://example.com/thumbnail.jpg"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Publish Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Publish course</span>
                    <p className="text-xs text-gray-500">Students will be able to enroll in this course</p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  {submitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={submitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredCourses.length}</span> of{' '}
          <span className="font-medium">{courses.length}</span> results
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;