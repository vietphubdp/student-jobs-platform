import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { JobListPage } from './pages/jobs/JobListPage';
import { JobDetailPage } from './pages/jobs/JobDetailPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';

import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentApplicationsPage } from './pages/student/StudentApplicationsPage';

import { EmployerDashboard } from './pages/employer/EmployerDashboard';
import { EmployerProfilePage } from './pages/employer/EmployerProfilePage';
import { EmployerJobsPage } from './pages/employer/EmployerJobsPage';
import { JobApplicationsPage } from './pages/employer/JobApplicationsPage';
import { CreateJobPage } from './pages/employer/CreateJobPage';
import { EditJobPage } from './pages/employer/EditJobPage';

import { AdminDashboard } from './pages/admin/AdminDashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobListPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/users/:id" element={<UserProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Authenticated Common Routes */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'EMPLOYER', 'ADMIN']}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/applications"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Protected Employer Routes */}
        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYER']}>
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYER']}>
              <EmployerJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/:id/applications"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYER']}>
              <JobApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/create"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYER']}>
              <CreateJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYER']}>
              <EditJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/profile"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYER']}>
              <EmployerProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
