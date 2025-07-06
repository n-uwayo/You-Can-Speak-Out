import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MoreVertical,
  RefreshCw,
  Loader,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Users,
  BookOpen,
  Calendar,
  Shield,
  X,
  Eye,
  EyeOff,
  Code
} from 'lucide-react';

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiMissing, setApiMissing] = useState(false);
  const [users, setUsers] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    avatar: '',
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from PHP backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost/api/users.php', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Users API endpoint not found. Please implement users.php endpoint.');
          setApiMissing(true);
          setUsers([]);
          return;
        } else if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to view users.');
        } else {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }
      }

      const data = await response.json();
      setUsers(data?.data || data?.users || data || []);
      setApiMissing(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        console.warn('Cannot connect to PHP backend. Please start your PHP server.');
        setApiMissing(true);
        setUsers([]);
        return;
      }
      
      if (!error.message.includes('Failed to fetch users: 404')) {
        alert(error.message || 'Failed to load users. Please try again.');
      }
      
      setUsers([]);
    } finally {
      setLoading(false);
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
    if (!formData.name || !formData.email || (!editingUser && !formData.password)) {
      alert('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (apiMissing) {
      alert('Cannot create/update users: PHP API endpoints not implemented yet.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        avatar: formData.avatar.trim() || null,
        is_active: formData.is_active ? 1 : 0
      };

      if (!editingUser || formData.password) {
        userData.password = formData.password;
      }

      const url = editingUser 
        ? `http://localhost/api/users.php?id=${editingUser.id}`
        : 'http://localhost/api/users.php';
      
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        if (response.status === 404) {
          setApiMissing(true);
          throw new Error('Users PHP endpoint not found. Please implement the backend first.');
        }
        
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `${method} failed with status ${response.status}`);
      }

      const result = await response.json();
      alert(result.message || (editingUser ? 'User updated successfully!' : 'User created successfully!'));
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      console.error('Submit error:', error);
      
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        setApiMissing(true);
        alert('Cannot connect to PHP backend. Please start your PHP server.');
        return;
      }
      
      alert(error.message || 'Failed to save user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'STUDENT',
      avatar: user.avatar || '',
      is_active: user.is_active == 1
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (apiMissing) {
      alert('Cannot delete users: PHP API endpoints not implemented yet.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost/api/users.php?id=${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            setApiMissing(true);
            throw new Error('Users PHP endpoint not found.');
          }
          
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          throw new Error(errorData.message || `Delete failed with status ${response.status}`);
        }

        const result = await response.json();
        alert(result.message || 'User deleted successfully!');
        fetchUsers();
      } catch (error) {
        console.error('Delete error:', error);
        
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
          setApiMissing(true);
          alert('Cannot connect to PHP backend. Please start your PHP server.');
          return;
        }
        
        alert(error.message || 'Failed to delete user. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'STUDENT',
      avatar: '',
      is_active: true
    });
    setEditingUser(null);
    setShowPassword(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  // Helper functions
  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'INSTRUCTOR':
        return 'bg-blue-100 text-blue-800';
      case 'STUDENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4" />;
      case 'INSTRUCTOR':
        return <BookOpen className="w-4 h-4" />;
      case 'STUDENT':
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getStatusColor = (isActive) => {
    return isActive == 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (isActive) => {
    return isActive == 1 ? 'Active' : 'Inactive';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAvatarInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getCourseCount = (user) => {
    return user.course_count || 0;
  };

  const getCourseLabel = (user) => {
    if (user.role === 'INSTRUCTOR') {
      return 'courses created';
    } else if (user.role === 'STUDENT') {
      return 'enrolled courses';
    }
    return 'courses';
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole.toUpperCase();
    
    return matchesSearch && matchesRole;
  });

  // Get user stats
  const userStats = {
    total: users.length,
    active: users.filter(u => u.is_active == 1).length,
    students: users.filter(u => u.role === 'STUDENT').length,
    instructors: users.filter(u => u.role === 'INSTRUCTOR').length,
    admins: users.filter(u => u.role === 'ADMIN').length
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage users with PHP and MySQL backend</p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-gray-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{userStats.total}</div>
                <div className="text-xs text-gray-500">Total Users</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{userStats.active}</div>
                <div className="text-xs text-gray-500">Active</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <User className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{userStats.students}</div>
                <div className="text-xs text-gray-500">Students</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{userStats.instructors}</div>
                <div className="text-xs text-gray-500">Instructors</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-red-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{userStats.admins}</div>
                <div className="text-xs text-gray-500">Admins</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Missing Banner */}
      {apiMissing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                PHP MySQL API Not Implemented
              </h3>
              <p className="text-sm text-yellow-700 mb-4">
                Your PHP backend is not running or doesn't have the users endpoints yet. Set up the following:
              </p>
              
              <div className="bg-yellow-100 rounded-md p-3 mb-4">
                <div className="text-xs font-mono text-yellow-800 space-y-1">
                  <div><strong>File:</strong> /api/users.php</div>
                  <div><strong>Methods:</strong> GET, POST, PUT, DELETE</div>
                  <div><strong>Database:</strong> MySQL with users table</div>
                </div>
              </div>

              <div className="text-sm text-yellow-700 mb-3">
                <strong>Setup Instructions:</strong>
              </div>
              
              <div className="bg-gray-900 rounded-md p-3 text-xs text-green-400 font-mono overflow-x-auto mb-4">
{`1. Install XAMPP/MAMP/WAMP
2. Start Apache and MySQL
3. Create database: learning_management
4. Create users table (see below)
5. Create api/users.php file
6. Access via http://localhost/api/users.php`}
              </div>

              <div className="text-sm text-yellow-700 mb-3">
                <strong>MySQL Users Table:</strong>
              </div>
              
              <div className="bg-gray-900 rounded-md p-3 text-xs text-green-400 font-mono overflow-x-auto mb-4">
{`CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('STUDENT', 'INSTRUCTOR', 'ADMIN') DEFAULT 'STUDENT',
  avatar VARCHAR(500) NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`}
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <span className="text-yellow-700">PHP MySQL backend setup required</span>
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

      {/* Header Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full md:w-80"
              />
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="instructor">Instructors</option>
              <option value="admin">Administrators</option>
            </select>
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
              disabled={apiMissing}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={apiMissing ? 'Please implement PHP backend first' : 'Add a new user'}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New User
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
          <Users className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {apiMissing ? 'PHP MySQL API Not Set Up' :
             searchTerm || selectedRole !== 'all' ? 'No users match your search' : 'No users yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {apiMissing ? 'Please set up your PHP backend with MySQL database to manage users' :
             searchTerm || selectedRole !== 'all' 
              ? 'Try adjusting your search terms or filters' 
              : 'Add your first user to get started'
            }
          </p>
          {(!searchTerm && selectedRole === 'all' && !apiMissing) && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2 inline" />
              Add Your First User
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-sm font-medium">
                              {getAvatarInitials(user.name)}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.is_active)}`}>
                        {getStatusText(user.is_active)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{getCourseCount(user)}</div>
                        <div className="text-xs text-gray-500">{getCourseLabel(user)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {/* <button 
                          className="text-green-600 hover:text-green-900"
                          title="Send email"
                        >
                          <Mail className="w-4 h-4" />
                        </button> */}
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete user"
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

      {/* Create/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>
            
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {editingUser ? '(leave blank to keep current)' : '*'}
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required={!editingUser}
                    placeholder={editingUser ? 'Enter new password' : 'Enter password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 px-3 py-2.5 pr-10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="STUDENT">Student</option>
                  <option value="INSTRUCTOR">Instructor</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar URL (optional)
                </label>
                <input
                  name="avatar"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Active Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Active User</span>
                    <p className="text-xs text-gray-500">User can access the platform</p>
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
                  {submitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
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
    </div>
  );
};

export default UsersPage;