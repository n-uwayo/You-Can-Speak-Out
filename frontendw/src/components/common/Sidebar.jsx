import React from 'react';
import {
   Home,
   Users,
   Video,
   FileText,
   MessageSquare,
   BarChart3,
   Settings,
   BookOpen,
   Award,
   Upload
} from 'lucide-react';

const Sidebar = ({ isOpen, activeTab, setActiveTab }) => {
  // const currentUser = { role: 'ADMIN' }; //static check
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    // { id: 'users', label: 'Manage Users', icon: Users },
    currentUser?.role === 'ADMIN' && { id: 'users', label: 'Manage Users', icon: Users },
    // { id: 'videos', label: 'Video Management', icon: Video },
    { id: 'courses', label: 'Tutorial Management', icon: BookOpen },
    { id: 'tasks', label: 'Task Management', icon: FileText },
    { id: 'submissions', label: 'Submissions', icon: Upload },
    // { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    // { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    // { id: 'achievements', label: 'Achievements', icon: Award },
    // { id: 'settings', label: 'Settings', icon: Settings },
  ].filter(Boolean);

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
      <div className={`fixed left-0 top-0 z-30 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out overflow-y-auto lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 bg-gray-800 border-b border-gray-700">
          <h2 className="text-xl font-bold">YCSpout</h2>
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
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
          <div className="flex items-center px-3 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-sm font-medium">A</span>
            </div>
            <div>
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;