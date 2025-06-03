import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import ChatPage from './components/ChatPage';
import ExplorePage from './components/ExplorePage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ProfileDashboard from './components/profile/ProfileDashboard';
import SkinProfileForm from './components/profile/SkinProfileForm';
import HairProfileForm from './components/profile/HairProfileForm';
import LifestyleProfileForm from './components/profile/LifestyleProfileForm';
import HealthProfileForm from './components/profile/HealthProfileForm';
import MakeupProfileForm from './components/profile/MakeupProfileForm';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfileDashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile/skin" element={
                <ProtectedRoute>
                  <SkinProfileForm />
                </ProtectedRoute>
              } />
              <Route path="/profile/hair" element={
                <ProtectedRoute>
                  <HairProfileForm />
                </ProtectedRoute>
              } />
              <Route path="/profile/lifestyle" element={
                <ProtectedRoute>
                  <LifestyleProfileForm />
                </ProtectedRoute>
              } />
              <Route path="/profile/health" element={
                <ProtectedRoute>
                  <HealthProfileForm />
                </ProtectedRoute>
              } />
              <Route path="/profile/makeup" element={
                <ProtectedRoute>
                  <MakeupProfileForm />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
