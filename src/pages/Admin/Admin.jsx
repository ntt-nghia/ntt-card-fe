import React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BarChart3, CreditCard, Database, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { Layout } from '@components/common/Layout';
import { AdminDashboard } from '@pages/Admin/AdminDashboard.jsx';
import { DeckManagement } from '@pages/Admin/DeckManagement.jsx';
import { CardManagement } from '@pages/Admin/CardManagement.jsx';
import { Analytics } from '@pages/Admin/Analytics.jsx';
import { UserManagement } from '@pages/Admin/UserManagement.jsx';

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Check if user is admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const navigationItems = [
    { path: '/admin', label: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
    { path: '/admin/decks', label: 'Decks', icon: <CreditCard className="h-4 w-4" /> },
    { path: '/admin/cards', label: 'Cards', icon: <Database className="h-4 w-4" /> },
    { path: '/admin/analytics', label: 'Analytics', icon: <TrendingUp className="h-4 w-4" /> },
    { path: '/admin/users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Connection Game</title>
        <meta name="description" content="Admin dashboard for Connection Game management" />
      </Helmet>

      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <nav className="flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                {navigationItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/decks" element={<DeckManagement />} />
              <Route path="/cards" element={<CardManagement />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Admin;
