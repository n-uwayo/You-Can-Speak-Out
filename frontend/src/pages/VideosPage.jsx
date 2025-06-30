import React, { useState, useEffect } from 'react';
import { Search, Play, Edit, Trash2, Eye, Upload, X } from 'lucide-react';

const VideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: '',
    category: 'programming',
    status: 'Draft',
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Separate function to fetch videos
  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost/api/get_videos.php');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      // Handle different response structures
      setVideos(data.data || data.videos || data || []);
    } catch (err) {
      setError(err.message);
      console.error('Fetch videos error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch videos on component mount
  useEffect(() => {
    fetchVideos();
  }, []);

  // Form input handler
  const handleInputChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Submit new video
  const handleSubmit = async e => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    // Basic validation
    if (!form.title || !form.videoUrl) {
      setFormError('Title and Video URL are required.');
      setFormLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost/api/add_video.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        // Success! Close modal and reset form
        setShowModal(false);
        setForm({
          title: '',
          description: '',
          videoUrl: '',
          duration: '',
          category: 'programming',
          status: 'Draft',
        });
        
        // Refresh the videos list
        await fetchVideos();
        
        // Show success message (optional)
        alert('Video added successfully!');
      } else {
        setFormError(data.message || 'Failed to add video.');
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setFormError("Network error: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowModal(false);
    setForm({
      title: '',
      description: '',
      videoUrl: '',
      duration: '',
      category: 'programming',
      status: 'Draft',
    });
    setFormError(null);
  };

  // Delete video function
  const handleDelete = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        const response = await fetch(`http://localhost/api/delete_video.php?id=${videoId}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (data.success) {
          await fetchVideos(); // Refresh list after delete
          alert('Video deleted successfully!');
        } else {
          alert(data.message || 'Failed to delete video.');
        }
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete video: ' + err.message);
      }
    }
  };

  const filteredVideos = videos.filter(video => {
    const titleMatch = video.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const instructorMatch = video.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || instructorMatch;

    const matchesCategory =
      selectedCategory === 'all' ||
      (video.category && video.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const getStatusColor = status => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Private':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const VideoCard = ({ video }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <Play className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
          {video.duration || '--:--'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 truncate">{video.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">{video.instructor}</span>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(video.status)}`}>
            {video.status}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{video.views ?? 0} views</span>
          <span>{video.uploadDate || ''}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700">
            <Eye className="w-4 h-4 inline mr-1" />
            View
          </button>
          <button className="text-gray-600 hover:text-gray-800 p-2">
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(video.id)}
            className="text-red-600 hover:text-red-800 p-2"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="p-6 flex justify-center items-center min-h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-lg text-gray-600">Loading videos...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-center">
      <div className="text-red-600 mb-4">Error: {error}</div>
      <button 
        onClick={fetchVideos}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Video Management</h1>
        <p className="text-gray-600 mt-2">Manage your video content and uploads</p>
      </div>

      {/* Header Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="database">Database</option>
              <option value="marketing">Marketing</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 text-sm ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              >
                List
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchVideos}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Refresh videos"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </button>
          </div>
        </div>
      </div>

      {/* Videos Count */}
      {videos.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Total: {videos.length} videos | Filtered: {filteredVideos.length} videos
        </div>
      )}

      {/* Videos Grid/List */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
          <Play className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {videos.length === 0 ? 'No videos yet' : 'No videos match your search'}
          </h3>
          <p className="text-gray-500 mb-6">
            {videos.length === 0 ? 'Upload your first video to get started' : 'Try adjusting your search terms or filters'}
          </p>
          {videos.length === 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5 mr-2 inline" />
              Upload Your First Video
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
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
                {filteredVideos.map(video => (
                  <tr key={video.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center mr-4">
                          <Play className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{video.title}</div>
                          <div className="text-sm text-gray-500">{video.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{video.instructor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{video.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{video.views}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(video.status)}`}
                      >
                        {video.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(video.id)}
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

      {/* Modal form for adding video */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-lg max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold mb-4">Add New Video</h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={form.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL *
                </label>
                <input
                  id="videoUrl"
                  name="videoUrl"
                  type="url"
                  value={form.videoUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (e.g., 45:30)
                </label>
                <input
                  id="duration"
                  name="duration"
                  type="text"
                  value={form.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="database">Database</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Private">Private</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={formLoading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? 'Adding...' : 'Add Video'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredVideos.length}</span> of{' '}
          <span className="font-medium">{videos.length}</span> results
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">Previous</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">2</button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default VideosPage;