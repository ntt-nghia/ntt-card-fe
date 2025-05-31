import { useSelector, useDispatch } from 'react-redux';
import { gameSelectors } from '@store/game/gameSelectors';
import { gameActions } from '@store/game/gameSlice';

export const useGame = () => {
  const dispatch = useDispatch();
  const gameState = useSelector(gameSelectors.getGameState);
  const currentSession = useSelector(gameSelectors.getCurrentSession);
  const currentCard = useSelector(gameSelectors.getCurrentCard);
  const isSessionActive = useSelector(gameSelectors.getIsSessionActive);
  const currentLevel = useSelector(gameSelectors.getCurrentLevel);
  const cardsRemaining = useSelector(gameSelectors.getCardsRemaining);
  const sessionStats = useSelector(gameSelectors.getSessionStats);
  const isLoading = useSelector(gameSelectors.getIsLoading);
  const isDrawing = useSelector(gameSelectors.getIsDrawing);
  const error = useSelector(gameSelectors.getError);

  const startSession = (sessionData) => {
    dispatch(gameActions.startSessionRequest(sessionData));
  };

  const getSession = (sessionId) => {
    dispatch(gameActions.getSessionRequest({ sessionId }));
  };

  const drawCard = (sessionId) => {
    dispatch(gameActions.drawCardRequest({ sessionId }));
  };

  const completeCard = (sessionId, cardId) => {
    dispatch(gameActions.completeCardRequest({ sessionId, cardId }));
  };

  const skipCard = (sessionId, cardId) => {
    dispatch(gameActions.skipCardRequest({ sessionId, cardId }));
  };

  const endSession = (sessionId) => {
    dispatch(gameActions.endSessionRequest({ sessionId }));
  };

  const getSessionStats = (sessionId) => {
    dispatch(gameActions.getSessionStatsRequest({ sessionId }));
  };

  const clearSession = () => {
    dispatch(gameActions.clearSession());
  };

  const clearError = () => {
    dispatch(gameActions.clearError());
  };

  // Computed values
  const sessionProgress = useSelector(gameSelectors.getSessionProgress);

  return {
    // State
    gameState,
    currentSession,
    currentCard,
    isSessionActive,
    currentLevel,
    cardsRemaining,
    sessionStats,
    isLoading,
    isDrawing,
    error,
    sessionProgress,

    // Actions
    startSession,
    getSession,
    drawCard,
    completeCard,
    skipCard,
    endSession,
    getSessionStats,
    clearSession,
    clearError,
  };
};
