export const gameSelectors = {
  getGameState: (state) => state.game,

  getCurrentSession: (state) => state.game.currentSession,

  getCurrentCard: (state) => state.game.currentCard,

  getIsSessionActive: (state) => state.game.isSessionActive,

  getCurrentLevel: (state) => state.game.currentLevel,

  getCardsRemaining: (state) => state.game.cardsRemaining,

  getDrawnCards: (state) => state.game.drawnCards,

  getCompletedCards: (state) => state.game.completedCards,

  getSkippedCards: (state) => state.game.skippedCards,

  getSessionStats: (state) => state.game.sessionStats,

  getIsLoading: (state) => state.game.isLoading,

  getIsDrawing: (state) => state.game.isDrawing,

  getError: (state) => state.game.error,

  getRelationshipType: (state) => state.game.relationshipType,

  getSelectedDeckIds: (state) => state.game.selectedDeckIds,

  getLanguage: (state) => state.game.language,

  getConfiguration: (state) => state.game.configuration,

  getSessionProgress: (state) => {
    const { drawnCards, completedCards, cardsRemaining } = state.game;
    const totalCards = drawnCards.length + cardsRemaining;
    const progress = totalCards > 0 ? (drawnCards.length / totalCards) * 100 : 0;
    return { progress, completed: completedCards.length, total: totalCards };
  },
};
