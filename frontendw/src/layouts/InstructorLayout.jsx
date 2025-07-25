import React, { useState } from 'react';
import InstructorHeader from '../components/instructor/InstructorHeader';
import InstructorSidebar from '../components/instructor/InstructorSidebar';
import Footer from '../components/common/Footer';
import InstructorDashboardPage from '../pages/instructor/InstructorDashboardPage';
import VideosPage from '../pages/instructor/VideosPage';
import TasksPage from '../pages/instructor/TasksPage';
import SubmissionsPage from '../pages/instructor/SubmissionsPage';
import FeedbackPage from '../pages/instructor/FeedbackPage';
import StudentsPage from '../pages/instructor/StudentsPage';
import AnalyticsPage from '../pages/instructor/AnalyticsPage';
import ProfilePage from '../pages/instructor/ProfilePage';

const InstructorLayout = () => {
  console.log('InstructorLayout rendering...');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <InstructorDashboardPage />;
      case 'videos':
        return <VideosPage />;
      case 'tasks':
        return <TasksPage />;
      case 'submissions':
        return <SubmissionsPage />;
      case 'feedback':
        return <FeedbackPage />;
      case 'students':
        return <StudentsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <InstructorDashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <InstructorSidebar 
        isOpen={sidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <InstructorHeader toggleSidebar={toggleSidebar} />
        
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

export default InstructorLayout;
