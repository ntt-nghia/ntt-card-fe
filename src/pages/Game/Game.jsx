import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, RefreshCw, X } from 'lucide-react';

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
    clearError,
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loading size="large" text="Loading game session..." />
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Session Not Found</h2>
          <p className="mb-6 text-gray-600">The game session you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
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

      <div className="mobile-full-height min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        {/* Header */}
        <div className="safe-area-top border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
                <div>
                  <h1 className="text-lg font-semibold capitalize text-gray-900">
                    {currentSession.relationshipType?.replace('_', ' ')} Session
                  </h1>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<X className="h-4 w-4" />}
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
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="rounded-md border border-error-200 bg-error-50 px-4 py-3 text-error-700">
              {error}
            </div>
          </div>
        )}

        {/* Main Game Area */}
        <div className="mobile-safe-bottom mx-auto max-w-4xl px-4 py-8">
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
              <div className="card mx-auto max-w-2xl p-8">
                <div className="mb-8">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
                    <RefreshCw className="h-10 w-10 text-primary-600" />
                  </div>
                  <h2 className="mb-4 font-heading text-2xl font-bold text-gray-900">
                    Ready for the next card?
                  </h2>
                  <p className="mb-6 text-gray-600">
                    Draw a card to continue building connections with your group.
                  </p>
                </div>

                <Button
                  size="lg"
                  leftIcon={<RefreshCw className="h-5 w-5" />}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">End Session?</h3>
              <p className="mb-6 text-gray-600">
                Are you sure you want to end this session? Your progress will be saved.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" fullWidth onClick={() => setShowEndConfirm(false)}>
                  Continue Playing
                </Button>
                <Button variant="error" fullWidth onClick={handleEndSession}>
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
