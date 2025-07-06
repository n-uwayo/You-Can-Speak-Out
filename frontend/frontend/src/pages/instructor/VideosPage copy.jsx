import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Play, 
  Edit, 
  Trash2, 
  Upload, 
  Eye, 
  Calendar, 
  Search,
  Clock,
  BookOpen,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  SortAsc,
  ExternalLink
} from 'lucide-react';

const VideosPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    description: '',
    duration: '',
    order: '',
    moduleId: '',
    isPublished: false
  });

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      setVideos([
        {
          id: '1',
          title: 'Introduction to React Hooks',
          description: 'Learn the fundamentals of React Hooks including useState and useEffect.',
          videoUrl: 'https://youtube.com/watch?v=example1',
          duration: '15:30',
          order: 1,
          isPublished: true,
          createdAt: new Date('2024-01-15').toISOString(),
          updatedAt: new Date('2024-01-15').toISOString(),
          module: {
            id: 'm1',
            title: 'React Fundamentals',
            course: {
              id: 'c1',
              title: 'Complete React Course',
              instructor: { name: 'John Doe' }
            }
          },
          progresses: [
            { watchedSeconds: 800, isCompleted: false },
            { watchedSeconds: 930, isCompleted: true }
          ],
          comments: [
            { id: 'comment1', text: 'Great explanation!' },
            { id: 'comment2', text: 'Very helpful tutorial' }
          ]
        },
        {
          id: '2',
          title: 'Advanced State Management',
          description: 'Deep dive into complex state management patterns in React applications.',
          videoUrl: 'https://youtube.com/watch?v=example2',
          duration: '28:45',
          order: 2,
          isPublished: false,
          createdAt: new Date('2024-01-20').toISOString(),
          updatedAt: new Date('2024-01-22').toISOString(),
          module: {
            id: 'm1',
            title: 'React Fundamentals',
            course: {
              id: 'c1',
              title: 'Complete React Course',
              instructor: { name: 'John Doe' }
            }
          },
          progresses: [
            { watchedSeconds: 450, isCompleted: false }
          ],
          comments: []
        },
        {
          id: '3',
          title: 'Component Lifecycle Methods',
          description: 'Understanding the lifecycle of React components and when to use each method.',
          videoUrl: 'https://youtube.com/watch?v=example3',
          duration: '22:15',
          order: 3,
          isPublished: true,
          createdAt: new Date('2024-01-25').toISOString(),
          updatedAt: new Date('2024-01-25').toISOString(),
          module: {
            id: 'm2',
            title: 'Advanced React Concepts',
            course: {
              id: 'c1',
              title: 'Complete React Course',
              instructor: { name: 'John Doe' }
            }
          },
          progresses: [],
          comments: [
            { id: 'comment3', text: 'Could use more examples' }
          ]
        }
      ]);

      setCourses([
        {
          id: 'c1',
          title: 'Complete React Course',
          description: 'Master React from basics to advanced concepts',
          instructor: { name: 'John Doe' }
        },
        {
          id: 'c2',
          title: 'Node.js Backend Development',
          description: 'Build scalable backend applications with Node.js',
          instructor: { name: 'Jane Smith' }
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  // Mock modules data
  useEffect(() => {
    if (selectedCourseId) {
      const mockModules = selectedCourseId === 'c1' ? [
        { id: 'm1', title: 'React Fundamentals', order: 1 },
        { id: 'm2', title: 'Advanced React Concepts', order: 2 },
        { id: 'm3', title: 'State Management', order: 3 }
      ] : [
        { id: 'm4', title: 'Node.js Basics', order: 1 },
        { id: 'm5', title: 'Express.js Framework', order: 2 }
      ];
      setModules(mockModules);
    } else {
      setModules([]);
    }
  }, [selectedCourseId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourseId(courseId);
    setFormData(prev => ({
      ...prev,
      moduleId: ''
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.videoUrl || !formData.moduleId) {
      alert('Please fill in all required fields');
      return;
    }

    // Mock API call
    const newVideo = {
      id: Date.now().toString(),
      ...formData,
      order: Number(formData.order) || videos.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      module: modules.find(m => m.id === formData.moduleId) || { title: 'Unknown Module' },
      progresses: [],
      comments: []
    };

    if (editingVideo) {
      setVideos(prev => prev.map(video => 
        video.id === editingVideo.id ? { ...video, ...newVideo, id: editingVideo.id } : video
      ));
      alert('Video updated successfully!');
    } else {
      setVideos(prev => [...prev, newVideo]);
      alert('Video uploaded successfully!');
    }
    
    handleCloseModal();
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      videoUrl: video.videoUrl,
      description: video.description || '',
      duration: video.duration || '',
      order: video.order?.toString() || '',
      moduleId: video.module?.id || '',
      isPublished: video.isPublished
    });
    setSelectedCourseId(video.module?.course?.id || '');
    setShowModal(true);
  };

  const handleDelete = (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      setVideos(prev => prev.filter(video => video.id !== videoId));
      alert('Video deleted successfully!');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      videoUrl: '',
      description: '',
      duration: '',
      order: '',
      moduleId: '',
      isPublished: false
    });
    setSelectedCourseId('');
    setEditingVideo(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const getStatusIcon = (isPublished) => {
    return isPublished ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-gray-400" />
    );
  };

  const getStatusColor = (isPublished) => {
    return isPublished ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';
  };

  const getViewsCount = (progresses) => {
    return progresses?.length || 0;
  };

  const getCompletionRate = (progresses) => {
    if (!progresses?.length) return 0;
    const completed = progresses.filter(p => p.isCompleted).length;
    return Math.round((completed / progresses.length) * 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const sortVideos = (videos) => {
    return [...videos].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'duration':
          return (a.duration || '').localeCompare(b.duration || '');
        case 'order':
          return (a.order || 0) - (b.order || 0);
        case 'createdAt':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  };

  const filteredAndSortedVideos = sortVideos(
    videos.filter(video => {
      const matchesSearch = video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           video.module?.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || 
                           (filterStatus === 'published' && video.isPublished) ||
                           (filterStatus === 'draft' && !video.isPublished);
      
      return matchesSearch && matchesFilter;
    })
  );

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading videos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Library</h1>
          <p className="text-gray-600">Manage your educational video content</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center">
              <Video className="w-4 h-4 mr-1" />
              {videos.length} total videos
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
              {videos.filter(v => v.isPublished).length} published
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 md:mt-0 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Video
        </button>
      </div>

      {/* Search, Filter and Sort */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search videos by title, description, or module..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="createdAt">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="order">Sort by Order</option>
              <option value="duration">Sort by Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      {filteredAndSortedVideos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
          <Video className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No videos match your search' : 'No videos yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search terms or filters' 
              : 'Upload your first video to get started'
            }
          </p>
          {(!searchTerm && filterStatus === 'all') && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2 inline" />
              Add Your First Video
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:border-indigo-200">
              {/* Video Thumbnail Area */}
              <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 h-48 flex items-center justify-center">
                <Video className="w-16 h-16 text-white opacity-80" />
                
                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                    {video.duration}
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${getStatusColor(video.isPublished)}`}>
                    {getStatusIcon(video.isPublished)}
                    <span className="ml-1">{video.isPublished ? 'Published' : 'Draft'}</span>
                  </span>
                </div>

                {/* Order Badge */}
                {video.order && (
                  <div className="absolute top-3 right-3 bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                    #{video.order}
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-lg leading-tight">
                  {video.title}
                </h3>
                
                {video.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {video.description}
                  </p>
                )}

                {/* Module and Course Info */}
                <div className="mb-3 text-sm">
                  <div className="flex items-center text-indigo-600 mb-1">
                    <BookOpen className="w-4 h-4 mr-1" />
                    <span className="font-medium">{video.module?.title}</span>
                  </div>
                  {video.module?.course && (
                    <div className="flex items-center text-gray-500">
                      <User className="w-4 h-4 mr-1" />
                      <span>{video.module.course.title}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{getViewsCount(video.progresses)} views</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(video.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {video.progresses?.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Completion Rate</span>
                      <span>{getCompletionRate(video.progresses)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getCompletionRate(video.progresses)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => window.open(video.videoUrl, '_blank')}
                    className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center transition-colors text-sm font-medium"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Watch
                  </button>
                  <button 
                    onClick={() => handleEdit(video)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Edit video"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => handleDelete(video.id)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                    title="Delete video"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              {editingVideo ? 'Edit Video' : 'Add New Video'}
            </h2>
            
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title *
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="Enter an engaging video title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Course and Module Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course *
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={handleCourseChange}
                    required
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module *
                  </label>
                  <select
                    name="moduleId"
                    value={formData.moduleId}
                    onChange={handleInputChange}
                    required
                    disabled={!selectedCourseId || modules.length === 0}
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">
                      {!selectedCourseId 
                        ? 'Select course first' 
                        : modules.length === 0 
                          ? 'No modules available' 
                          : 'Select a module'
                      }
                    </option>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL *
                </label>
                <div className="relative">
                  <input
                    name="videoUrl"
                    type="url"
                    required
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 px-3 py-2.5 pr-10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Duration and Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <div className="relative">
                    <input
                      name="duration"
                      type="text"
                      placeholder="e.g., 15:30"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-3 py-2.5 pr-10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order in Module
                  </label>
                  <input
                    name="order"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="4"
                  placeholder="Provide a detailed description of what students will learn..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Publish Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Publish immediately</span>
                    <p className="text-xs text-gray-500">Students will be able to access this video right away</p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {editingVideo ? 'Update Video' : 'Add Video'}
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideosPage;