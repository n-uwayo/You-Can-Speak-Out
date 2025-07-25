import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import '@testing-library/jest-dom';

// Import your actual components (mock them if they're complex)
import Login from './components/auth/Login';
import AdminLayout from './layouts/AdminLayout';
import InstructorLayout from './layouts/InstructorLayout';
import VideoLearningPlatform from './layouts/VideoLearningPlatform';
import CourseLearningInterface from './layouts/CourseLearningInterface';
import StudentDashboard from './pages/student/StudentDashboard';
import VideoPlayerPage from './layouts/VideoPlayerPage';
import CertificateVerificationPage from './pages/CertificateVerification';

// Mock all the complex components
jest.mock('./components/auth/Login', () => {
  return function Login() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

jest.mock('./layouts/AdminLayout', () => {
  return function AdminLayout() {
    return <div data-testid="admin-layout">Admin Layout</div>;
  };
});

jest.mock('./layouts/InstructorLayout', () => {
  return function InstructorLayout() {
    return <div data-testid="instructor-layout">Instructor Layout</div>;
  };
});

jest.mock('./layouts/VideoLearningPlatform', () => {
  return function VideoLearningPlatform() {
    return <div data-testid="video-learning-platform">Video Learning Platform</div>;
  };
});

jest.mock('./layouts/CourseLearningInterface', () => {
  return function CourseLearningInterface() {
    return <div data-testid="course-learning-interface">Course Learning Interface</div>;
  };
});

jest.mock('./pages/student/StudentDashboard', () => {
  return function StudentDashboard() {
    return <div data-testid="student-dashboard">Student Dashboard</div>;
  };
});

jest.mock('./layouts/VideoPlayerPage', () => {
  return function VideoPlayerPage() {
    return <div data-testid="video-player-page">Video Player Page</div>;
  };
});

jest.mock('./pages/CertificateVerification', () => {
  return function CertificateVerification() {
    return <div data-testid="certificate-verification">Certificate Verification</div>;
  };
});

// Create a testable version of your routes without BrowserRouter
const AppRoutes = () => (
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
      <Route path="/verify/:certificateNumber?" element={<CertificateVerificationPage />} />
    </Routes>
  </div>
);

// Helper function to render with MemoryRouter
const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AppRoutes />
    </MemoryRouter>
  );
};

describe('App Routing', () => {
  test('renders home page at root path', () => {
    renderWithRouter(['/']);
    expect(screen.getByTestId('video-learning-platform')).toBeInTheDocument();
  });

  test('renders login page at /login', () => {
    renderWithRouter(['/login']);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('renders videos page at /videos', () => {
    renderWithRouter(['/videos']);
    expect(screen.getByTestId('video-player-page')).toBeInTheDocument();
  });

  test('renders admin layout at /admin path', () => {
    renderWithRouter(['/admin']);
    expect(screen.getByTestId('admin-layout')).toBeInTheDocument();
  });


  test('renders course interface at /course path', () => {
    renderWithRouter(['/course']);
    expect(screen.getByTestId('course-learning-interface')).toBeInTheDocument();
  });

  test('renders student dashboard at /student/home', () => {
    renderWithRouter(['/student/home']);
    expect(screen.getByTestId('student-dashboard')).toBeInTheDocument();
  });

  test('renders certificate verification at /verify path', () => {
    renderWithRouter(['/verify/123']);
    expect(screen.getByTestId('certificate-verification')).toBeInTheDocument();
  });


  test('app has correct CSS class', () => {
    const { container } = renderWithRouter(['/']);
    expect(container.querySelector('.App')).toBeInTheDocument();
  });
});