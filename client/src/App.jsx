import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import useAuthStore from './store/authStore';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/auth" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard initialTab="overview" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/new-analysis" 
          element={
            <ProtectedRoute>
              <Dashboard initialTab="upload" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/project-story" 
          element={
            <ProtectedRoute>
              <Dashboard initialTab="story" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analysis-results" 
          element={
            <ProtectedRoute>
              <Dashboard initialTab="analysis" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/compare-projects" 
          element={
            <ProtectedRoute>
              <Dashboard initialTab="compare" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/viva-prep" 
          element={
            <ProtectedRoute>
              <Dashboard initialTab="viva" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resume-vault" 
          element={
            <ProtectedRoute>
              <Dashboard initialTab="resume" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mock-interview" 
          element={
            <ProtectedRoute>
              <Dashboard initialTab="interview" />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
