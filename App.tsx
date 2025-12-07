import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Upload from './pages/Upload';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import TrackDetail from './pages/TrackDetail';
import PlaylistDetail from './pages/PlaylistDetail';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center text-white"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>;
  if (!currentUser) return <Navigate to="/" />;
  
  return <>{children}</>;
};

// Public Route (redirects to home if logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return null;
  if (currentUser) return <Navigate to="/feed" />;
  
  return <>{children}</>;
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing / Public Entry */}
      <Route path="/" element={
        <PublicRoute>
          <Landing />
        </PublicRoute>
      } />
      
      {/* Login Page (Alternative entry) */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      {/* Main Feed (Protected, essentially the "Home" for logged in users) */}
      <Route path="/feed" element={
        <ProtectedRoute>
          <Layout><Home /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/explore" element={<Layout><Explore /></Layout>} />
      <Route path="/track/:trackId" element={<Layout><TrackDetail /></Layout>} />
      <Route path="/playlist/:playlistId" element={<Layout><PlaylistDetail /></Layout>} />
      
      <Route 
        path="/upload" 
        element={
          <ProtectedRoute>
            <Layout><Upload /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/:userId" 
        element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PlayerProvider>
        <Router>
          <AppRoutes />
        </Router>
      </PlayerProvider>
    </AuthProvider>
  );
};

export default App;