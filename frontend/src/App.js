import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import Landing from './pages/Landing';
import Register from './pages/Register';
import RegisterJobSeeker from './pages/RegisterJobSeeker';
import RegisterEmployer from './pages/RegisterEmployer';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import JobPreview from './pages/JobPreview';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import EmployerDashboard from './pages/EmployerDashboard';
import EmployerJobForm from './pages/EmployerJobForm';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import JobSeekerHome from './pages/JobSeekerHome';
import EmployerHome from './pages/EmployerHome';
import EmployerProfile from './pages/EmployerProfile';
import LoginJobSeeker from './pages/LoginJobSeeker';
import LoginEmployer from './pages/LoginEmployer';
import LoginAdmin from './pages/LoginAdmin';
import AdminDashboard from './pages/AdminDashboard';

// Import layout component
import Layout from './components/Layout';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes without layout */}
              <Route path="/" element={<Landing />} />
              <Route path="/login/jobseeker" element={<LoginJobSeeker />} />
              <Route path="/login/employer" element={<LoginEmployer />} />
              <Route path="/login/admin" element={<LoginAdmin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/jobseeker" element={<RegisterJobSeeker />} />
              <Route path="/register/employer" element={<RegisterEmployer />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Routes with layout */}
              <Route element={<Layout />}>
                {/* Public routes */}
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/jobs/:id/preview" element={<JobPreview />} />
                
                {/* Protected routes - Job seekers */}
                <Route 
                  path="/jobseeker/home"
                  element={
                    <ProtectedRoute roles={['jobseeker']}>
                      <JobSeekerHome />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute roles={['jobseeker']}>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/applications" 
                  element={
                    <ProtectedRoute roles={['jobseeker']}>
                      <Applications />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Protected routes - Employers */}
                <Route 
                  path="/employer/home"
                  element={
                    <ProtectedRoute roles={['employer']}>
                      <EmployerHome />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute roles={['employer']}>
                      <EmployerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/profile" 
                  element={
                    <ProtectedRoute roles={['employer']}>
                      <EmployerProfile />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/employer/jobs/new"
                  element={
                    <ProtectedRoute roles={['employer']}>
                      <EmployerJobForm mode="create" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employer/jobs/:jobId/edit"
                  element={
                    <ProtectedRoute roles={['employer']}>
                      <EmployerJobForm mode="edit" />
                    </ProtectedRoute>
                  }
                />

                {/* Protected routes - Admin */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;