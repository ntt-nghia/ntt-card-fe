import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  RefreshCw,
  X
} from 'lucide-react';

import { useGame } from '@hooks/useGame';
import Button from '@components/common/Button';
import Loading from '@components/common/Loading';
import CardDisplay from '@components/game/CardDisplay/CardDisplay';
import SessionProgress from '@components/game/SessionProgress/SessionProgress';

const Game = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const {
    currentSession,
    currentCard,
    isSessionActive,
    currentLevel,
    cardsRemaining,
    sessionProgress,
    isLoading,
    isDrawing,
    error,
    getSession,
    drawCard,
    completeCard,
    skipCard,
    endSession,
    clearError
  } = useGame();

  const [showEndConfirm, setShowEndConfirm] = useState(false);

  useEffect(() => {
    if (sessionId) {
      getSession(sessionId);
    }
  }, [sessionId, getSession]);

  useEffect(() => {
    if (error) {
      // Auto-clear errors after 5 seconds
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleDrawCard = () => {
    if (sessionId) {
      drawCard(sessionId);
    }
  };

  const handleCompleteCard = () => {
    if (sessionId && currentCard) {
      completeCard(sessionId, currentCard.id);
    }
  };

  const handleSkipCard = () => {
    if (sessionId && currentCard) {
      skipCard(sessionId, currentCard.id);
    }
  };

  const handleEndSession = async () => {
    if (sessionId) {
      await endSession(sessionId);
      navigate('/dashboard');
    }
  };

  if (isLoading && !currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="large" text="Loading game session..." />
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Not Found</h2>
          <p className="text-gray-600 mb-6">The game session you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Game Session - Connection Game</title>
        <meta name="description" content="Active game session" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 mobile-full-height">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 safe-area-top">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 capitalize">
                    {currentSession.relationshipType?.replace('_', ' ')} Session
                  </h1>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<X className="w-4 h-4" />}
                onClick={() => setShowEndConfirm(true)}
              >
                End Session
              </Button>
            </div>

            {/* Session Progress Component */}
            <div className="mt-4">
              <SessionProgress
                currentLevel={currentLevel}
                cardsRemaining={cardsRemaining}
                sessionProgress={sessionProgress}
                statistics={currentSession}
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-md">
              {error}
            </div>
          </div>
        )}

        {/* Main Game Area */}
        <div className="max-w-4xl mx-auto px-4 py-8 mobile-safe-bottom">
          {currentCard ? (
            /* Card Display Component */
            <CardDisplay
              card={currentCard}
              onComplete={handleCompleteCard}
              onSkip={handleSkipCard}
              isLoading={isLoading}
            />
          ) : (
            /* Draw Card Interface */
            <div className="text-center">
              <div className="card p-8 max-w-2xl mx-auto">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RefreshCw className="w-10 h-10 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                    Ready for the next card?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Draw a card to continue building connections with your group.
                  </p>
                </div>

                <Button
                  size="lg"
                  leftIcon={<RefreshCw className="w-5 h-5" />}
                  onClick={handleDrawCard}
                  loading={isDrawing}
                  disabled={isDrawing}
                  className="btn-touch"
                >
                  {isDrawing ? 'Drawing Card...' : 'Draw Card'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* End Session Confirmation Modal */}
        {showEndConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                End Session?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to end this session? Your progress will be saved.
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowEndConfirm(false)}
                >
                  Continue Playing
                </Button>
                <Button
                  variant="error"
                  fullWidth
                  onClick={handleEndSession}
                >
                  End Session
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Game;
