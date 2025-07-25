import React, { useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import DashboardPage from '../pages/DashboardPage';
import UsersPage from '../pages/UsersPage';
import VideosPage from '../pages/VideosPage';
import TasksPage from '../pages/TasksPage';
import SubmissionsPage from '../pages/SubmissionsPage';
import FeedbackPage from '../pages/FeedbackPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import CoursesPage from '../pages/CoursesPage';
import AchievementsPage from '../pages/AchievementsPage';
import SettingsPage from '../pages/SettingsPage';

const AdminLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'users':
        return <UsersPage />;
      case 'videos':
        return <VideosPage />;
      case 'courses':
        return <CoursesPage />;
      case 'tasks':
        return <TasksPage />;
      case 'submissions':
        return <SubmissionsPage />;
      case 'feedback':
        return <FeedbackPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'achievements':
        return <AchievementsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;