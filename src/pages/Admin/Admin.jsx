import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Database,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  TrendingUp,
  Activity,
  DollarSign,
  Eye
} from 'lucide-react';

import { useAuth } from '@hooks/useAuth';
import Button from '@components/common/Button';
import Loading from '@components/common/Loading';
import { Layout } from '@components/common/Layout';

// Admin Dashboard Overview
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDecks: 0,
    totalCards: 0,
    totalSessions: 0,
    revenue: 0,
    activeUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading stats - replace with actual API call
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        totalDecks: 28,
        totalCards: 456,
        totalSessions: 3891,
        revenue: 12450,
        activeUsers: 89
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <Loading size="large" text="Loading admin dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-100 text-success-600 mr-4">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Decks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDecks}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-warning-100 text-warning-600 mr-4">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cards</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCards}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSessions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            fullWidth
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => window.location.href = '/admin/decks/new'}
          >
            Create Deck
          </Button>
          <Button
            variant="outline"
            fullWidth
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => window.location.href = '/admin/cards/new'}
          >
            Create Card
          </Button>
          <Button
            variant="outline"
            fullWidth
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => window.location.href = '/admin/cards/bulk'}
          >
            Bulk Import
          </Button>
          <Button
            variant="outline"
            fullWidth
            leftIcon={<BarChart3 className="w-4 h-4" />}
            onClick={() => window.location.href = '/admin/analytics'}
          >
            View Analytics
          </Button>
        </div>
      </div>
    </div>
  );
};

// Deck Management Component
const DeckManagement = () => {
  const [decks, setDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate loading decks - replace with actual API call
    setTimeout(() => {
      setDecks([
        { id: 1, name: { en: 'Friends Starter Pack' }, type: 'FREE', cardCount: { total: 25 }, status: 'active' },
        { id: 2, name: { en: 'Deep Conversations' }, type: 'PREMIUM', cardCount: { total: 30 }, status: 'active' },
        { id: 3, name: { en: 'Workplace Connections' }, type: 'FREE', cardCount: { total: 20 }, status: 'draft' }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <Loading size="large" text="Loading decks..." />;
  }

  const filteredDecks = decks.filter(deck =>
    deck.name.en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Deck Management</h1>
        <Button leftIcon={<Plus className="w-4 h-4" />}>
          Create New Deck
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search decks..."
              className="input-field pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
            Filters
          </Button>
        </div>
      </div>

      {/* Decks Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deck Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cards
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDecks.map((deck) => (
                <tr key={deck.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{deck.name.en}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      deck.type === 'FREE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {deck.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {deck.cardCount.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      deck.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {deck.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="w-3 h-3" />}>
                        View
                      </Button>
                      <Button variant="ghost" size="sm" leftIcon={<Edit className="w-3 h-3" />}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" leftIcon={<Trash2 className="w-3 h-3" />}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Card Management Component
const CardManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Card Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" leftIcon={<Upload className="w-4 h-4" />}>
            Bulk Import
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            Create Card
          </Button>
        </div>
      </div>

      <div className="card p-6">
        <p className="text-gray-600">Card management interface coming soon...</p>
      </div>
    </div>
  );
};

// Analytics Component
const Analytics = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold text-gray-900">Analytics Dashboard</h1>

      <div className="card p-6">
        <p className="text-gray-600">Analytics dashboard coming soon...</p>
      </div>
    </div>
  );
};

// User Management Component
const UserManagement = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold text-gray-900">User Management</h1>

      <div className="card p-6">
        <p className="text-gray-600">User management interface coming soon...</p>
      </div>
    </div>
  );
};

// Main Admin Component
const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Check if user is admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const navigationItems = [
    { path: '/admin', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { path: '/admin/decks', label: 'Decks', icon: <CreditCard className="w-4 h-4" /> },
    { path: '/admin/cards', label: 'Cards', icon: <Database className="w-4 h-4" /> },
    { path: '/admin/analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { path: '/admin/users', label: 'Users', icon: <Users className="w-4 h-4" /> },
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Admin Navigation */}
            <div className="mb-8">
              <nav className="flex flex-wrap gap-1 p-1 bg-white rounded-lg shadow-sm border border-gray-200">
                {navigationItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Admin Content */}
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
