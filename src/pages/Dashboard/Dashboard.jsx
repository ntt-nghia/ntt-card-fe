import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Play,
  Users,
  Heart,
  Briefcase,
  Home as HomeIcon,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
} from 'lucide-react';

import { useAuth } from '@hooks/useAuth';
import { useUser } from '@hooks/useUser';
import { useDecks } from '@hooks/useDecks';
import { useGame } from '@hooks/useGame';
import { useControlledEffect, useControlledDispatch } from '@hooks/useControlledEffect';
import Button from '@components/common/Button';
import Loading from '@components/common/Loading';
import { RELATIONSHIP_TYPES } from '@utils/constants';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    statistics,
    getStatistics,
    isLoading: userLoading,
    error: userError,
    clearError: clearUserError,
  } = useUser();

  const {
    filteredDecks,
    getAllDecks,
    isLoading: decksLoading,
    error: decksError,
    clearError: clearDecksError,
  } = useDecks();

  const { startSession, isLoading: gameLoading } = useGame();

  const [selectedRelationshipType, setSelectedRelationshipType] = useState(null);
  const [hasTriedLoading, setHasTriedLoading] = useState(false);

  // Use controlled dispatch to prevent spam
  const { safeDispatch } = useControlledDispatch(
    (action) => {
      if (action.type === 'GET_STATISTICS') {
        getStatistics();
      } else if (action.type === 'GET_DECKS') {
        getAllDecks();
      }
    },
    {
      cooldown: 2000, // 2 seconds between same requests
      maxAttempts: 3,
    }
  );

  useControlledEffect(
    () => {
      if (hasTriedLoading) return;

      console.log('Dashboard: Loading initial data...');
      setHasTriedLoading(true);

      safeDispatch({ type: 'GET_STATISTICS' });
      setTimeout(() => {
        safeDispatch({ type: 'GET_DECKS' });
      }, 500);
    },
    [user?.uid ? user.uid : null],
    {
      enabled: !!user?.uid && !hasTriedLoading,
      maxExecutions: 1,
      cooldown: 5000,
    }
  );

  const relationshipTypeData = [
    {
      type: RELATIONSHIP_TYPES.FRIENDS,
      icon: <Users className="h-6 w-6" />,
      title: 'Friends',
      description: 'Deepen friendships through shared experiences',
      color: 'bg-blue-500',
      sessions: statistics?.relationshipTypeUsage?.friends || 0,
    },
    {
      type: RELATIONSHIP_TYPES.ESTABLISHED_COUPLES,
      icon: <Heart className="h-6 w-6" />,
      title: 'Established Couples',
      description: 'Refresh and deepen long-term relationships',
      color: 'bg-red-500',
      sessions: statistics?.relationshipTypeUsage?.established_couples || 0,
    },
    {
      type: RELATIONSHIP_TYPES.COLLEAGUES,
      icon: <Briefcase className="h-6 w-6" />,
      title: 'Colleagues',
      description: 'Build better working relationships',
      color: 'bg-green-500',
      sessions: statistics?.relationshipTypeUsage?.colleagues || 0,
    },
    {
      type: RELATIONSHIP_TYPES.FAMILY,
      icon: <HomeIcon className="h-6 w-6" />,
      title: 'Family',
      description: 'Bridge generational gaps and strengthen bonds',
      color: 'bg-purple-500',
      sessions: statistics?.relationshipTypeUsage?.family || 0,
    },
  ];

  const handleStartGame = async (relationshipType) => {
    try {
      // Get available decks for this relationship type
      const availableDecks = filteredDecks.filter(
        (deck) =>
          deck.relationshipType === relationshipType && (deck.tier === 'FREE' || deck.hasAccess)
      );

      if (availableDecks.length === 0) {
        // Redirect to deck selection if no decks available
        navigate(`/decks?relationshipType=${relationshipType}`);
        return;
      }

      // Start session with the first available deck
      const sessionData = {
        relationshipType,
        selectedDeckIds: [availableDecks[0].id],
        language: user?.language || 'en',
      };

      await startSession(sessionData);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleRetryUserData = () => {
    clearUserError();
    safeDispatch({ type: 'GET_STATISTICS' });
  };

  const handleRetryDecks = () => {
    clearDecksError();
    safeDispatch({ type: 'GET_DECKS' });
  };

  // Show loading state only if we haven't tried loading yet
  const isInitialLoading = (userLoading || decksLoading) && !hasTriedLoading;

  if (isInitialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="large" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - Connection Game</title>
        <meta name="description" content="Your Connection Game dashboard" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Error Messages */}
          {userError && (
            <div className="mb-6 rounded-md border border-error-200 bg-error-50 p-4">
              <div className="flex items-center">
                <AlertCircle className="mr-3 h-5 w-5 text-error-400" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-error-800">
                    Unable to load user statistics
                  </h3>
                  <p className="mt-1 text-sm text-error-700">{userError}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRetryUserData}>
                  Retry
                </Button>
              </div>
            </div>
          )}

          {decksError && (
            <div className="mb-6 rounded-md border border-warning-200 bg-warning-50 p-4">
              <div className="flex items-center">
                <AlertCircle className="mr-3 h-5 w-5 text-warning-400" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-warning-800">
                    Unable to load game decks
                  </h3>
                  <p className="mt-1 text-sm text-warning-700">
                    {decksError} - You can still start games with basic content.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRetryDecks}>
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="mb-2 font-heading text-3xl font-bold text-gray-900">
              Welcome back, {user?.displayName}!
            </h1>
            <p className="text-gray-600">Ready to build some meaningful connections today?</p>
          </div>

          {/* Statistics Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-primary-100 p-3 text-primary-600">
                  <Play className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics?.totalSessions || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-success-100 p-3 text-success-600">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Duration</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((statistics?.averageSessionDuration || 0) / 60)}m
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-warning-100 p-3 text-warning-600">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Favorite Type</p>
                  <p className="text-2xl font-bold capitalize text-gray-900">
                    {statistics?.favoriteRelationshipType?.replace('_', ' ') || 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start Section */}
          <div className="mb-8">
            <h2 className="mb-6 font-heading text-2xl font-bold text-gray-900">
              Start a New Session
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relationshipTypeData.map((relationship) => (
                <div
                  key={relationship.type}
                  className="card group cursor-pointer p-6 transition-shadow hover:shadow-card-hover"
                  onClick={() => handleStartGame(relationship.type)}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className={`rounded-full p-3 ${relationship.color} text-white transition-transform group-hover:scale-110`}
                    >
                      {relationship.icon}
                    </div>
                    {relationship.sessions > 0 && (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                        {relationship.sessions} sessions
                      </span>
                    )}
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-gray-900">{relationship.title}</h3>
                  <p className="mb-4 text-sm text-gray-600">{relationship.description}</p>

                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    leftIcon={<Play className="h-4 w-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartGame(relationship.type);
                    }}
                    disabled={gameLoading}
                  >
                    {gameLoading ? 'Starting...' : 'Start Game'}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          {statistics?.totalSessions > 0 && (
            <div className="mb-8">
              <h2 className="mb-6 font-heading text-2xl font-bold text-gray-900">Your Progress</h2>

              <div className="card p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      Relationship Type Usage
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(statistics?.relationshipTypeUsage || {}).map(
                        ([type, count]) => {
                          const total = statistics?.totalSessions || 1;
                          const percentage = Math.round((count / total) * 100);
                          const relationshipData = relationshipTypeData.find(
                            (r) => r.type === type
                          );

                          return (
                            <div key={type} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div
                                  className={`h-3 w-3 rounded-full ${relationshipData?.color || 'bg-gray-400'} mr-3`}
                                />
                                <span className="text-sm font-medium capitalize text-gray-700">
                                  {type.replace('_', ' ')}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <div className="mr-3 h-2 w-24 rounded-full bg-gray-200">
                                  <div
                                    className={`h-2 rounded-full ${relationshipData?.color || 'bg-gray-400'}`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="w-12 text-right text-sm text-gray-600">
                                  {count} ({percentage}%)
                                </span>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        fullWidth
                        leftIcon={<Users className="h-4 w-4" />}
                        onClick={() => navigate('/profile')}
                      >
                        View Profile & Stats
                      </Button>
                      <Button
                        variant="outline"
                        fullWidth
                        leftIcon={<TrendingUp className="h-4 w-4" />}
                        onClick={() => navigate('/decks')}
                      >
                        Browse Deck Library
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* First Time User Help */}
          {!statistics?.totalSessions && !userError && (
            <div className="card border-primary-200 bg-primary-50 p-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                  <Play className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Ready for your first session?
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  Choose a relationship type above to start building meaningful connections. Each
                  session is designed to help you and your group grow closer through engaging
                  questions and activities.
                </p>
                <Button
                  leftIcon={<Users className="h-4 w-4" />}
                  onClick={() => handleStartGame(RELATIONSHIP_TYPES.FRIENDS)}
                  disabled={gameLoading}
                >
                  {gameLoading ? 'Starting...' : 'Start with Friends'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
