import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Permits from './pages/Permits';
import PermitDetail from './pages/PermitDetail';
import NewPermit from './pages/NewPermit';
import Profile from './pages/Profile';
import Counties from './pages/Counties';
import Admin from './pages/Admin';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      
      {/* Protected routes */}
      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="permits" element={<Permits />} />
        <Route path="permits/new" element={<NewPermit />} />
        <Route path="permits/:id" element={<PermitDetail />} />
        <Route path="counties" element={<Counties />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<Admin />} />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
