import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Play, Users, Heart, Briefcase, Home as HomeIcon, TrendingUp, Clock, Star } from 'lucide-react';

import { useAuth } from '@hooks/useAuth';
import { useUser } from '@hooks/useUser';
import { useDecks } from '@hooks/useDecks';
import { useGame } from '@hooks/useGame';
import Button from '@components/common/Button';
import Loading from '@components/common/Loading';
import { RELATIONSHIP_TYPES } from '@utils/constants';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { statistics, getStatistics, isLoading: userLoading } = useUser();
  const { filteredDecks, getAllDecks, isLoading: decksLoading } = useDecks();
  const { startSession, isLoading: gameLoading } = useGame();

  const [selectedRelationshipType, setSelectedRelationshipType] = useState(null);

  useEffect(() => {
    // Load user statistics and available decks
    getStatistics();
    getAllDecks();
  }, [getStatistics, getAllDecks]);

  const relationshipTypeData = [
    {
      type: RELATIONSHIP_TYPES.FRIENDS,
      icon: <Users className="w-6 h-6" />,
      title: 'Friends',
      description: 'Deepen friendships through shared experiences',
      color: 'bg-blue-500',
      sessions: statistics?.relationshipTypeUsage?.new_couples || 0
    },
    {
      type: RELATIONSHIP_TYPES.ESTABLISHED_COUPLES,
      icon: <Heart className="w-6 h-6" />,
      title: 'Established Couples',
      description: 'Refresh and deepen long-term relationships',
      color: 'bg-red-500',
      sessions: statistics?.relationshipTypeUsage?.established_couples || 0
    },
    {
      type: RELATIONSHIP_TYPES.COLLEAGUES,
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Colleagues',
      description: 'Build better working relationships',
      color: 'bg-green-500',
      sessions: statistics?.relationshipTypeUsage?.colleagues || 0
    },
    {
      type: RELATIONSHIP_TYPES.FAMILY,
      icon: <HomeIcon className="w-6 h-6" />,
      title: 'Family',
      description: 'Bridge generational gaps and strengthen bonds',
      color: 'bg-purple-500',
      sessions: statistics?.relationshipTypeUsage?.family || 0
    }
  ];

  const handleStartGame = async (relationshipType) => {
    // Get available decks for this relationship type
    const availableDecks = filteredDecks.filter(deck =>
      deck.relationshipType === relationshipType &&
      (deck.type === 'FREE' || deck.hasAccess)
    );

    if (availableDecks.length === 0) {
      // Redirect to deck selection if no decks available
      navigate(`/decks?relationshipType=${relationshipType}`);
      return;
    }

    // Start session with the first available deck (or show deck selection)
    const sessionData = {
      relationshipType,
      selectedDeckIds: [availableDecks[0].id],
      language: user?.language || 'en'
    };

    try {
      await startSession(sessionData);
      // Redirect to game page after session is created
      // The game saga will handle the redirect
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const isLoading = userLoading || decksLoading || gameLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
              Welcome back, {user?.displayName}!
            </h1>
            <p className="text-gray-600">
              Ready to build some meaningful connections today?
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
                  <Play className="w-6 h-6" />
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
                <div className="p-3 rounded-full bg-success-100 text-success-600 mr-4">
                  <Clock className="w-6 h-6" />
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
                <div className="p-3 rounded-full bg-warning-100 text-warning-600 mr-4">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Favorite Type</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">
                    {statistics?.favoriteRelationshipType?.replace('_', ' ') || 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
              Start a New Session
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relationshipTypeData.map((relationship) => (
                <div
                  key={relationship.type}
                  className="card p-6 hover:shadow-card-hover transition-shadow cursor-pointer group"
                  onClick={() => handleStartGame(relationship.type)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-full ${relationship.color} text-white group-hover:scale-110 transition-transform`}>
                      {relationship.icon}
                    </div>
                    {relationship.sessions > 0 && (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {relationship.sessions} sessions
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {relationship.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {relationship.description}
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    leftIcon={<Play className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartGame(relationship.type);
                    }}
                  >
                    Start Game
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          {statistics?.totalSessions > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Your Progress
              </h2>

              <div className="card p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Relationship Type Usage
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(statistics?.relationshipTypeUsage || {}).map(([type, count]) => {
                        const total = statistics?.totalSessions || 1;
                        const percentage = Math.round((count / total) * 100);
                        const relationshipData = relationshipTypeData.find(r => r.type === type);

                        return (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full ${relationshipData?.color || 'bg-gray-400'} mr-3`} />
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {type.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                                <div
                                  className={`h-2 rounded-full ${relationshipData?.color || 'bg-gray-400'}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12 text-right">
                                {count} ({percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        fullWidth
                        leftIcon={<Users className="w-4 h-4" />}
                        onClick={() => navigate('/profile')}
                      >
                        View Profile & Stats
                      </Button>
                      <Button
                        variant="outline"
                        fullWidth
                        leftIcon={<TrendingUp className="w-4 h-4" />}
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
          {!statistics?.totalSessions && (
            <div className="card p-6 bg-primary-50 border-primary-200">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
                  <Play className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready for your first session?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose a relationship type above to start building meaningful connections.
                  Each session is designed to help you and your group grow closer through engaging questions and activities.
                </p>
                <Button
                  leftIcon={<Users className="w-4 h-4" />}
                  onClick={() => handleStartGame(RELATIONSHIP_TYPES.FRIENDS)}
                >
                  Start with Friends
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
