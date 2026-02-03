import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CASConfig from './pages/CASConfig';
import Situations from './pages/Situations';
import GlobalSettings from './pages/GlobalSettings';
import Affects from './pages/Affects';
import CMS from './pages/CMS';
import Simulator from './pages/Simulator';
import Users from './pages/Users';
import Analytics from './pages/Analytics';
import Responses from './pages/Responses';
import Feedback from './pages/Feedback';
import './index.css';
import { Loader2 } from 'lucide-react';

// Admin email whitelist - add authorized admin emails here
const ADMIN_EMAILS = [
  'daniel@monumental-i.com',
  // Add more admin emails as needed
];

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user email is in the admin whitelist
  if (!ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Your email ({user.email}) is not authorized to access this admin panel.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign in with different account
          </button>
        </div>
      </div>
    );
  }
  
  return children;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="cas-config" element={<CASConfig />} />
            <Route path="situations" element={<Situations />} />
            <Route path="affects" element={<Affects />} />
            <Route path="cms" element={<CMS />} />
            <Route path="simulator" element={<Simulator />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="analytics/responses" element={<Responses />} />
            <Route path="analytics/feedback" element={<Feedback />} />
            <Route path="users" element={<Users />} />
            <Route path="global-settings" element={<GlobalSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
