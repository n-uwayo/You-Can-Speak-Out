import React from 'react';
import {
  Home,
  Video,
  FileText,
  MessageSquare,
  BarChart3,
  Users,
  Upload,
  User
} from 'lucide-react';

const InstructorSidebar = ({ isOpen, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'videos', label: 'My Videos', icon: Video },
    { id: 'tasks', label: 'Tasks', icon: FileText },
    { id: 'submissions', label: 'Submissions', icon: Upload },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setActiveTab(activeTab)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 z-30 h-full w-64 bg-indigo-900 text-white transform transition-transform duration-300 ease-in-out overflow-y-auto lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 bg-indigo-800 border-b border-indigo-700">
          <h2 className="text-xl font-bold">EduPlatform</h2>
          <span className="ml-2 text-sm bg-indigo-600 px-2 py-1 rounded">Instructor</span>
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          <div className="px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-3 py-3 mb-2 text-left rounded-lg transition-colors duration-200 ${
                    activeTab === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="mt-8 px-3">
          <div className="flex items-center px-3 py-3 text-indigo-200 hover:bg-indigo-700 hover:text-white rounded-lg transition-colors duration-200">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-sm font-medium">I</span>
            </div>
            <div>
              <p className="text-sm font-medium">Instructor</p>
              <p className="text-xs text-indigo-300">John Doe</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorSidebar;