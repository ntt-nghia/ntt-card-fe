import React, {useEffect, useRef, useState} from 'react';
import {AlertCircle, Edit3, Globe, Save, TrendingUp, User, X} from 'lucide-react';

import {useAuth} from '@hooks/useAuth';
import {useUser} from '@hooks/useUser';
import {useErrorHandler} from '@hooks/useErrorHandler';
import Button from '@components/common/Button';
import ErrorBoundary from '@components/common/ErrorBoundary';

const Profile = () => {
  const {user} = useAuth();
  const userIdRef = useRef(user?.uid);

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
    error,
    clearError,
  } = useUser();

  const {handleAsyncError} = useErrorHandler();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    language: 'en',
  });
  const [formErrors, setFormErrors] = useState({});

  // Extract statistics data with defaults
  const totalSessions = statistics?.totalSessions || 0;
  const relationshipStats = statistics?.relationshipTypeUsage || {};

  // Initialize form when user data loads
  useEffect(() => {
    if (user) {
      setEditForm({
        displayName: user.displayName || '',
        language: user.language || 'en',
      });
    }
  }, [user]);
  useEffect(() => {
    // Only run if user ID actually changed
    if (!user?.uid || userIdRef.current === user.uid) return;

    userIdRef.current = user.uid;

    const loadData = async () => {
      try {
        await Promise.all([getProfile(), getStatistics()]);
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };

    loadData();
  }, [user?.uid]); // ✅ Only depend on primitive user ID

  // Clear errors when editing starts
  useEffect(() => {
    if (isEditing) {
      clearError();
      setFormErrors({});
    }
  }, [isEditing, clearError]);

  const validateForm = () => {
    const errors = {};

    if (!editForm.displayName.trim()) {
      errors.displayName = 'Display name is required';
    } else if (editForm.displayName.length > 50) {
      errors.displayName = 'Display name must be 50 characters or less';
    }

    if (!['en', 'vn'].includes(editForm.language)) {
      errors.language = 'Please select a valid language';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await handleAsyncError(
        async () => {
          // Update profile data
          if (editForm.displayName !== user?.displayName) {
            await updateProfile({displayName: editForm.displayName});
          }

          // Update language if changed
          if (editForm.language !== user?.language) {
            await updateLanguage(editForm.language);
          }

          setIsEditing(false);
        },
        {context: 'profile_update'}
      );
    } catch (error) {
      // Error is handled by useErrorHandler
      console.error('Profile update failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormErrors({});
    // Reset form to original values
    if (user) {
      setEditForm({
        displayName: user.displayName || '',
        language: user.language || 'en',
      });
    }
  };

  const handleFormChange = (field, value) => {
    setEditForm((prev) => ({...prev, [field]: value}));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Show loading state
  if (isLoading && !profile && !statistics) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-r-transparent"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-md border border-error-200 bg-error-50 px-4 py-3 text-error-700">
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5"/>
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-auto text-error-500 hover:text-error-700"
              >
                <X className="h-4 w-4"/>
              </button>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <ErrorBoundary level="component">
          <div className="card mb-8 p-6">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                  <User className="h-8 w-8 text-primary-600"/>
                </div>
                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div>
                        <input
                          type="text"
                          value={editForm.displayName}
                          onChange={(e) => handleFormChange('displayName', e.target.value)}
                          className={`border-b-2 bg-transparent font-heading text-2xl font-bold focus:outline-none ${
                            formErrors.displayName
                              ? 'border-error-500 text-error-900'
                              : 'border-gray-300 text-gray-900 focus:border-primary-500'
                          }`}
                          placeholder="Your display name"
                        />
                        {formErrors.displayName && (
                          <p className="mt-1 text-sm text-error-600">{formErrors.displayName}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-500"/>
                        <select
                          value={editForm.language}
                          onChange={(e) => handleFormChange('language', e.target.value)}
                          className={`rounded border px-2 py-1 text-sm ${
                            formErrors.language
                              ? 'border-error-500'
                              : 'border-gray-300 focus:border-primary-500'
                          }`}
                        >
                          <option value="en">English</option>
                          <option value="vn">Tiếng Việt</option>
                        </select>
                        {formErrors.language && (
                          <p className="text-sm text-error-600">{formErrors.language}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="font-heading text-2xl font-bold text-gray-900">
                        {user?.displayName || 'Your Profile'}
                      </h1>
                      <p className="text-gray-600">{user?.email}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          Member since{' '}
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : 'Unknown'}
                        </span>
                        <span className="flex items-center">
                          <Globe className="mr-1 h-4 w-4"/>
                          {user?.language === 'vn' ? 'Tiếng Việt' : 'English'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      leftIcon={<X className="h-4 w-4"/>}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveProfile}
                      loading={isSaving}
                      disabled={isSaving}
                      leftIcon={<Save className="h-4 w-4"/>}
                    >
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    leftIcon={<Edit3 className="h-4 w-4"/>}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-primary-50 p-4 text-center">
                <div className="mb-1 text-2xl font-bold text-primary-600">{totalSessions}</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>

              <div className="rounded-lg bg-success-50 p-4 text-center">
                <div className="mb-1 text-2xl font-bold text-success-600">
                  {Math.round((statistics?.averageSessionDuration || 0) / 60)}m
                </div>
                <div className="text-sm text-gray-600">Avg. Duration</div>
              </div>

              <div className="rounded-lg bg-warning-50 p-4 text-center">
                <div className="mb-1 text-2xl font-bold capitalize text-warning-600">
                  {statistics?.favoriteRelationshipType?.replace('_', ' ') || 'None'}
                </div>
                <div className="text-sm text-gray-600">Favorite Type</div>
              </div>
            </div>
          </div>
        </ErrorBoundary>

        {/* Statistics */}
        {totalSessions > 0 && (
          <ErrorBoundary level="component">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Relationship Usage */}
              <div className="card p-6">
                <h2 className="mb-6 flex items-center font-heading text-xl font-bold text-gray-900">
                  <TrendingUp className="mr-2 h-5 w-5"/>
                  Relationship Types
                </h2>

                {Object.keys(relationshipStats).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(relationshipStats).map(([type, count]) => {
                      const percentage = Math.round((count / totalSessions) * 100);
                      const colors = {
                        friends: 'bg-blue-500',
                        colleagues: 'bg-green-500',
                        new_couples: 'bg-pink-500',
                        established_couples: 'bg-red-500',
                        family: 'bg-purple-500',
                      };

                      return (
                        <div key={type}>
                          <div className="mb-2 flex justify-between text-sm font-medium text-gray-700">
                            <span className="capitalize">{type.replace('_', ' ')}</span>
                            <span>
                              {count} sessions ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                colors[type] || 'bg-gray-400'
                              }`}
                              style={{width: `${percentage}%`}}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-300"/>
                    <p>No session data available yet.</p>
                    <p className="text-sm">Start a game to see your statistics!</p>
                  </div>
                )}
              </div>

              {/* Additional Stats or Achievements */}
              <div className="card p-6">
                <h2 className="mb-6 font-heading text-xl font-bold text-gray-900">Your Progress</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <span className="font-medium text-gray-700">Sessions Completed</span>
                    <span className="text-lg font-bold text-primary-600">{totalSessions}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <span className="font-medium text-gray-700">Average Duration</span>
                    <span className="text-lg font-bold text-success-600">
                      {Math.round((statistics?.averageSessionDuration || 0) / 60)} min
                    </span>
                  </div>

                  {statistics?.favoriteRelationshipType && (
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <span className="font-medium text-gray-700">Favorite Category</span>
                      <span className="text-lg font-bold capitalize text-warning-600">
                        {statistics.favoriteRelationshipType.replace('_', ' ')}
                      </span>
                    </div>
                  )}

                  {/* Experience Level */}
                  <div className="rounded-lg bg-gradient-to-r from-primary-50 to-secondary-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-gray-700">Experience Level</span>
                      <span className="text-sm font-semibold text-primary-700">
                        {totalSessions < 5
                          ? 'Beginner'
                          : totalSessions < 20
                            ? 'Intermediate'
                            : 'Expert'}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-primary-500 transition-all duration-300"
                        style={{
                          width: `${Math.min((totalSessions / 20) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                      {totalSessions < 20
                        ? `${20 - totalSessions} more sessions to reach Expert level`
                        : 'Expert level achieved!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ErrorBoundary>
        )}

        {/* First Time User Message */}
        {totalSessions === 0 && !isLoading && (
          <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 p-8 text-center">
            <div className="mb-4">
              <User className="mx-auto h-16 w-16 text-primary-400"/>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Welcome to Connection Game!</h3>
            <p className="mb-6 text-gray-600">
              You haven't started any sessions yet. Begin your journey of building deeper connections
              by starting your first game session.
            </p>
            <Button onClick={() => (window.location.href = '/dashboard')} size="lg">
              Start Your First Session
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
