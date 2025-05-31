import React, {useEffect, useState} from 'react';
import {Helmet} from 'react-helmet-async';
import {Edit3, TrendingUp, User} from 'lucide-react';

import {useAuth} from '@hooks/useAuth';
import {useUser} from '@hooks/useUser';
import Button from '@components/common/Button';
import Loading from '@components/common/Loading';

const Profile = () => {
  const {user, updateProfile: updateAuthProfile} = useAuth();
  const {
    profile,
    statistics,
    preferences,
    getProfile,
    getStatistics,
    updateProfile,
    updatePreferences,
    updateLanguage,
    isLoading,
    error
  } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    language: 'en'
  });

  useEffect(() => {
    getProfile();
    getStatistics();
  }, [getProfile, getStatistics]);

  useEffect(() => {
    if (user) {
      setEditForm({
        displayName: user.displayName || '',
        language: user.language || 'en'
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      if (editForm.language !== user?.language) {
        await updateLanguage(editForm.language);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (isLoading && !profile && !statistics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="large" text="Loading your profile..."/>
      </div>
    );
  }

  const relationshipStats = statistics?.relationshipTypeUsage || {};
  const totalSessions = statistics?.totalSessions || 0;

  return (
    <>
      <Helmet>
        <title>Profile - Connection Game</title>
        <meta name="description" content="Your Connection Game profile and statistics"/>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="card p-6 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-600"/>
                </div>
                <div>
                  <h1 className="text-2xl font-heading font-bold text-gray-900">
                    {user?.displayName || 'Your Profile'}
                  </h1>
                  <p className="text-gray-600">{user?.email}</p>
                  <p className="text-sm text-gray-500">
                    Member since {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                leftIcon={<Edit3 className="w-4 h-4"/>}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {totalSessions}
                </div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>

              <div className="text-center p-4 bg-success-50 rounded-lg">
                <div className="text-2xl font-bold text-success-600 mb-1">
                  {Math.round((statistics?.averageSessionDuration || 0) / 60)}m
                </div>
                <div className="text-sm text-gray-600">Avg. Duration</div>
              </div>

              <div className="text-center p-4 bg-warning-50 rounded-lg">
                <div className="text-2xl font-bold text-warning-600 mb-1 capitalize">
                  {statistics?.favoriteRelationshipType?.replace('_', ' ') || 'None'}
                </div>
                <div className="text-sm text-gray-600">Favorite Type</div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {totalSessions > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Relationship Usage */}
              <div className="card p-6">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2"/>
                  Relationship Types
                </h2>

                <div className="space-y-4">
                  {Object.entries(relationshipStats).map(([type, count]) => {
                    const percentage = Math.round((count / totalSessions) * 100);
                    const colors = {
                      friends: 'bg-blue-500',
                      colleagues: 'bg-green-500',
                      new_couples: 'bg-pink-500',
                      established_couples: 'bg-red-500',
                      family: 'bg-purple-500'
                    };

                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                          <span className="capitalize">{type.replace('_', ' ')}</span>
                          <span>{count} sessions ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${colors[type] || 'bg-gray-400'}`}
                            style={{width: `${percentage}%`}}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>)}</div>
      </div>
    </>)
}
