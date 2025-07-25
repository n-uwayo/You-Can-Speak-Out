
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import AdminLayout from './layouts/AdminLayout';
import InstructorLayout from './layouts/InstructorLayout';
import VideoLearningPlatform from './layouts/VideoLearningPlatform';
import CourseLearningInterface from './layouts/CourseLearningInterface';
import StudentDashboard  from './pages/student/StudentDashboard';
import VideoPlayerPage from './layouts/VideoPlayerPage';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<VideoLearningPlatform />} />
          <Route path="/videos" element={<VideoPlayerPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/instructor/*" element={<InstructorLayout />} />
          <Route path="/course/*" element={<CourseLearningInterface />} />
          
          <Route path="/student/home" element={<StudentDashboard />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

