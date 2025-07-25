import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  FileText, 
  Edit, 
  Trash2,
  Clock,
  Users,
  Play,
  BookOpen,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Award,
  Download,
  Video,
  User,
  RefreshCw,
  Loader,
  AlertTriangle,
  Code,
  ExternalLink
} from 'lucide-react';

const TasksPage = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiMissing, setApiMissing] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    points: '',
    taskType: 'TEXT',
    status: 'ACTIVE',
    moduleId: '',
    relatedVideoId: ''
  });

  // PHP API base URL
  const API_BASE_URL = 'http://ycspout.umwalimu.com/api'; // Update this to match your PHP API folder

  useEffect(() => {
    fetchTasks();
    fetchCourses();
    // fetchVideos();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchModules(selectedCourseId);
    } else {
      setModules([]);
    }
  }, [selectedCourseId]);

  // API calls using PHP endpoints
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks.php`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Tasks API endpoint not found. Please implement tasks.php endpoint.');
          setApiMissing(true);
          setTasks([]);
          return;
        } else if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to view tasks.');
        } else {
          throw new Error(`Failed to fetch tasks: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (data.success) {
        setTasks(data.data || []);
        setApiMissing(false);
      } else {
        throw new Error(data.message || 'Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      
      if (!error.message.includes('Failed to fetch tasks: 404')) {
        alert(error.message || 'Failed to load tasks. Please try again.');
      }
      
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/courses.php`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCourses(data.data || []);
        } else {
          console.error('Failed to fetch courses:', data.message);
          setCourses([]);
        }
      } else {
        console.error('Failed to fetch courses');
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchModules = async (courseId) => {
    if (!courseId) {
      setModules([]);
      return;
    }

    setModulesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/modules.php?course_id=${courseId}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setModules(data.data || []);
        } else {
          console.error('Failed to fetch modules:', data.message);
          setModules([]);
        }
      } else {
        console.error('Failed to fetch modules');
        setModules([]);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      setModules([]);
    } finally {
      setModulesLoading(false);
    }
  };

  // const fetchVideos = async () => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     const response = await fetch(`${API_BASE_URL}/videos.php`, {
  //       method: 'GET',
  //       headers: { 
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       if (data.success) {
  //         setVideos(data.data || []);
  //       } else {
  //         console.error('Failed to fetch videos:', data.message);
  //         setVideos([]);
  //       }
  //     } else {
  //       console.error('Failed to fetch videos');
  //       setVideos([]);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching videos:', error);
  //     setVideos([]);
  //   }
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourseId(courseId);
    setSelectedModuleId('');
    setFormData(prev => ({
      ...prev,
      moduleId: '',
      relatedVideoId: ''
    }));
  };

  const handleModuleChange = (e) => {
    const moduleId = e.target.value;
    setSelectedModuleId(moduleId);
    setFormData(prev => ({
      ...prev,
      moduleId: moduleId,
      relatedVideoId: ''
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.moduleId || !formData.dueDate || !formData.description) {
      alert('Please fill in all required fields (Title, Module, Due Date, and Description)');
      return;
    }

    if (apiMissing) {
      alert('Cannot create tasks: API endpoints not implemented yet. Please implement the backend endpoints first.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        instructions: formData.instructions.trim(),
        moduleId: formData.moduleId,
        relatedVideoId: formData.relatedVideoId || null,
        dueDate: new Date(formData.dueDate).toISOString(),
        points: Number(formData.points) || 0,
        taskType: formData.taskType,
        status: formData.status
      };

      const url = editingTask 
        ? `${API_BASE_URL}/tasks.php?id=${editingTask.id}`
        : `${API_BASE_URL}/tasks.php`;
      
      const method = editingTask ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        if (response.status === 404) {
          setApiMissing(true);
          throw new Error('Tasks API endpoint not found. Please implement the backend endpoints first.');
        }
        
        throw new Error(`${method} failed with status ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert(editingTask ? 'Task updated successfully!' : 'Task created successfully!');
        handleCloseModal();
        fetchTasks(); // Refresh tasks list
      } else {
        throw new Error(result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(error.message || 'Failed to save task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    
    // Handle different data structures from your database
    const moduleInfo = task.module || {};
    const courseInfo = moduleInfo.course || {};
    
    setFormData({
      title: task.title || '',
      description: task.description || '',
      instructions: task.instructions || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      points: task.points?.toString() || '',
      taskType: task.taskType || 'TEXT',
      status: task.status || 'ACTIVE',
      moduleId: courseInfo.id || courseInfo.id || '',
      relatedVideoId: task.relatedVideoId || task.relatedVideo?.id || ''
    });
    
    setSelectedCourseId(courseInfo.id || '');
    setSelectedModuleId(task.moduleId || moduleInfo.id || '');
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (apiMissing) {
      alert('Cannot delete tasks: API endpoints not implemented yet. Please implement the backend endpoints first.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this task? This will also delete all submissions and cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/tasks.php?id=${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            setApiMissing(true);
            throw new Error('Tasks API endpoint not found. Please implement the backend endpoints first.');
          }
          
          throw new Error(`Delete failed with status ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          alert('Task deleted successfully!');
          fetchTasks(); // Refresh tasks list
        } else {
          throw new Error(result.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert(error.message || 'Failed to delete task. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      instructions: '',
      dueDate: '',
      points: '',
      taskType: 'TEXT',
      status: 'ACTIVE',
      moduleId: '',
      relatedVideoId: ''
    });
    setSelectedCourseId('');
    setSelectedModuleId('');
    setEditingTask(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleRefresh = () => {
    fetchTasks();
    fetchCourses();
    // fetchVideos();
  };

  // Helper functions
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'INACTIVE':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      case 'ARCHIVED':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const getTaskTypeIcon = (taskType) => {
    switch (taskType) {
      case 'TEXT':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'FILE':
        return <Download className="w-4 h-4 text-purple-600" />;
      case 'BOTH':
        return <Award className="w-4 h-4 text-indigo-600" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getCompletionRate = (submissions, totalStudents = 45) => {
    if (!submissions || !Array.isArray(submissions)) return 0;
    return Math.round((submissions.length / totalStudents) * 100);
  };

  const categorizedTasks = {
    active: tasks.filter(task => task.status === 'ACTIVE'),
    inactive: tasks.filter(task => task.status === 'INACTIVE'),
    archived: tasks.filter(task => task.status === 'ARCHIVED')
  };

  const filteredTasks = categorizedTasks[activeTab]?.filter(task =>
    task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.module?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getRelatedVideosForModule = (moduleId) => {
    return videos.filter(video => video.module_id === moduleId);
  };

  const findVideoById = (videoId) => {
    return videos.find(video => video.id === videoId);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks & Assignments</h1>
          <p className="text-gray-600">Manage assignments and assessments linked to your video content</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>{tasks.length} total tasks</span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
              {categorizedTasks.active.length} active
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={() => setShowModal(true)}
            disabled={apiMissing}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={apiMissing ? 'Please implement backend API endpoints first' : 'Create a new task'}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Task
          </button>
        </div>
      </div>

      {/* API Missing Banner */}
      {apiMissing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Tasks API Not Implemented
              </h3>
              <p className="text-sm text-yellow-700 mb-4">
                Your backend doesn't have the tasks endpoints yet. You need the following PHP files:
              </p>
              
              <div className="bg-yellow-100 rounded-md p-3 mb-4">
                <div className="text-xs font-mono text-yellow-800 space-y-1">
                  <div><strong>tasks.php</strong> - Task CRUD operations</div>
                  <div><strong>modules.php</strong> - Get modules for courses</div>
                  <div><strong>videos.php</strong> - Get videos for modules</div>
                </div>
              </div>

              <div className="text-sm text-yellow-700 mb-3">
                <strong>Expected response format:</strong>
              </div>
              
              <div className="bg-gray-900 rounded-md p-3 text-xs text-green-400 font-mono overflow-x-auto mb-4">
{`{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Task Title",
      "description": "Description",
      "instructions": "Instructions",
      "dueDate": "2025-01-25 23:59:00",
      "points": 100,
      "taskType": "TEXT|FILE|BOTH",
      "status": "ACTIVE|INACTIVE|ARCHIVED",
      "moduleId": 1,
      "relatedVideoId": 1,
      "module": {
        "id": 1,
        "title": "Module Name",
        "course": { "id": 1, "title": "Course Name" }
      },
      "submissions": [...]
    }
  ]
}`}
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <span className="text-yellow-700">Based on your database schema</span>
                <button
                  onClick={() => setApiMissing(false)}
                  className="text-yellow-600 hover:text-yellow-800 underline"
                >
                  Hide this message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tasks by title, description, or module..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'active', label: 'Active', count: categorizedTasks.active.length },
              { key: 'inactive', label: 'Inactive', count: categorizedTasks.inactive.length },
              { key: 'archived', label: 'Archived', count: categorizedTasks.archived.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Tasks List */}
        <div className="p-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {apiMissing ? 'Tasks API Not Implemented' :
                 searchTerm ? 'No tasks match your search' : 
                 tasks.length === 0 ? 'No tasks created yet' : 
                 `No ${activeTab} tasks`}
              </h3>
              <p className="text-gray-500 mb-6">
                {apiMissing ? 'Please implement the backend API endpoints to start using tasks' :
                 searchTerm ? 'Try adjusting your search terms' : 
                 tasks.length === 0 ? 'Create your first task to get started' :
                 `No tasks in ${activeTab} status. Try switching tabs or create a new task.`}
              </p>
              {(!searchTerm && tasks.length === 0 && !apiMissing) && (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2 inline" />
                  Create Your First Task
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Task Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          {getTaskTypeIcon(task.taskType)}
                          {task.points > 0 && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                              {task.points} pts
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Task Description */}
                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}

                      {/* Module and Video Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {task.module && (
                          <div className="flex items-center text-sm">
                            <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
                            <span className="text-gray-700">
                              <span className="font-medium">{task.module.title}</span>
                              {task.module.course && (
                                <span className="text-gray-500"> - {task.module.course.title}</span>
                              )}
                            </span>
                          </div>
                        )}
                        
                        {(task.relatedVideo || (task.relatedVideoId && findVideoById(task.relatedVideoId))) && (
                          <div className="flex items-center text-sm">
                            <Video className="w-4 h-4 mr-2 text-purple-600" />
                            <span className="text-gray-700">
                              <span className="font-medium">
                                {task.relatedVideo?.title || findVideoById(task.relatedVideoId)?.title}
                              </span>
                              {(task.relatedVideo?.duration || findVideoById(task.relatedVideoId)?.duration) && (
                                <span className="text-gray-500 ml-1">
                                  ({task.relatedVideo?.duration || findVideoById(task.relatedVideoId)?.duration})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Task Stats */}
                      <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          <Calendar className={`w-4 h-4 mr-1 ${isOverdue(task.dueDate) ? 'text-red-500' : ''}`} />
                          <span className={isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}>
                            Due: {formatDate(task.dueDate)}
                          </span>
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {task.submissions?.length || 0} submissions
                        </span>
                        <span className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          {getCompletionRate(task.submissions)}% completed
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Completion Progress</span>
                          <span>{getCompletionRate(task.submissions)}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              getCompletionRate(task.submissions) >= 80 ? 'bg-green-500' :
                              getCompletionRate(task.submissions) >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${getCompletionRate(task.submissions)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 ml-4">
                      
                      <button 
                        onClick={() => handleEdit(task)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center text-sm"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(task.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center text-sm"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            
            <div className="space-y-6">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="Enter task title (e.g., 'React Hooks Assignment')"
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
                  <div className="relative">
                    <select
                      value={selectedCourseId}
                      onChange={handleCourseChange}
                      required
                      disabled={coursesLoading}
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">
                        {coursesLoading ? 'Loading courses...' : 'Select a course'}
                      </option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                    {coursesLoading && (
                      <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                    )}
                  </div>
                  {courses.length === 0 && !coursesLoading && (
                    <p className="text-sm text-amber-600 mt-1 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      No courses available. Create a course first.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module *
                  </label>
                  <div className="relative">
                    <select
                      name="moduleId"
                      value={formData.moduleId}
                      onChange={handleModuleChange}
                      required
                      disabled={!selectedCourseId || modulesLoading}
                      className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">
                        {!selectedCourseId ? 'Select course first' : 
                         modulesLoading ? 'Loading modules...' : 
                         'Select a module'}
                      </option>
                      {modules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.title}
                        </option>
                      ))}
                    </select>
                    {modulesLoading && (
                      <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                    )}
                  </div>
                  {selectedCourseId && modules.length === 0 && !modulesLoading && (
                    <p className="text-sm text-amber-600 mt-1 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      No modules found for this course.
                    </p>
                  )}
                </div>
              </div>

              {/* Related Video Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Video (Optional)
                </label>
                <select
                  name="relatedVideoId"
                  value={formData.relatedVideoId}
                  onChange={handleInputChange}
                  disabled={!selectedModuleId}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">
                    {!selectedModuleId ? 'Select module first' : 'No specific video (general module task)'}
                  </option>
                  {getRelatedVideosForModule(selectedModuleId).map((video) => (
                    <option key={video.id} value={video.id}>
                      {video.title} {video.duration && `(${video.duration})`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Link this task to a specific video lesson for better context
                </p>
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  rows="3"
                  required
                  placeholder="Describe what students need to do..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Task Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Instructions
                </label>
                <textarea
                  name="instructions"
                  rows="4"
                  placeholder="Provide step-by-step instructions..."
                  value={formData.instructions}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Due Date, Points, and Task Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    name="dueDate"
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points
                  </label>
                  <input
                    name="points"
                    type="number"
                    min="0"
                    placeholder="100"
                    value={formData.points}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Type
                  </label>
                  <select
                    name="taskType"
                    value={formData.taskType}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="TEXT">Text Response</option>
                    <option value="FILE">File Upload</option>
                    <option value="BOTH">Text + File</option>
                  </select>
                </div>
              </div>

              {/* Task Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Active - Students can submit</option>
                  <option value="INACTIVE">Inactive - Hidden from students</option>
                  <option value="ARCHIVED">Archived - Read-only</option>
                </select>
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
                  {submitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={submitting}
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;