import React, { useEffect, useState } from 'react';
import Loading from '@components/common/Loading/index.js';
import {
  Activity,
  BarChart3,
  CreditCard,
  Database,
  DollarSign,
  Plus,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react';
import Button from '@components/common/Button/index.js';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDecks: 0,
    totalCards: 0,
    totalSessions: 0,
    revenue: 0,
    activeUsers: 0,
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
        activeUsers: 89,
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-primary-100 p-3 text-primary-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-success-100 p-3 text-success-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Decks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDecks}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-warning-100 p-3 text-warning-600">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cards</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCards}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-blue-100 p-3 text-blue-600">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalSessions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-green-100 p-3 text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-purple-100 p-3 text-purple-600">
              <TrendingUp className="h-6 w-6" />
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
        <h2 className="mb-6 font-heading text-xl font-bold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button
            variant="outline"
            fullWidth
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => (window.location.href = '/admin/decks/new')}
          >
            Create Deck
          </Button>
          <Button
            variant="outline"
            fullWidth
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => (window.location.href = '/admin/cards/new')}
          >
            Create Card
          </Button>
          <Button
            variant="outline"
            fullWidth
            leftIcon={<Upload className="h-4 w-4" />}
            onClick={() => (window.location.href = '/admin/cards/bulk')}
          >
            Bulk Import
          </Button>
          <Button
            variant="outline"
            fullWidth
            leftIcon={<BarChart3 className="h-4 w-4" />}
            onClick={() => (window.location.href = '/admin/analytics')}
          >
            View Analytics
          </Button>
        </div>
      </div>
    </div>
  );
};
