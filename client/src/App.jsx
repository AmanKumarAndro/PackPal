// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import Packing from './pages/Packing';
import Feedback from './pages/Feedback';
import TripDetailsPage from './pages/TripDetailsPage';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Auth wrapper component
const AuthWrapper = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <>
      
        {isLoginMode ? (
          <Login onToggleMode={toggleMode} />
        ) : (
          <Register onToggleMode={toggleMode} />
        )}
      </>
  );
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

// Main app routes
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route 
          path="/auth" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthWrapper />
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trips" 
          element={
            <ProtectedRoute>
              <Trips />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/packing/:tripId" 
          element={
            <ProtectedRoute>
              <Packing />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/feedback" 
          element={
            <ProtectedRoute>
              <Feedback />
            </ProtectedRoute>
          } 
        />
        {/* /trips/:id */}
        <Route 
          path="/trips/:id" 
          element={
            <ProtectedRoute>
              <TripDetailsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;