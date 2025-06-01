// src/store/game/gameSelectors.js - Enhanced with computed selectors
import { createSelector } from '@reduxjs/toolkit';

const getGameState = (state) => state.game;

export const gameSelectors = {
  getGameState,

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

  // Enhanced computed selectors
  getSessionProgress: createSelector(
    [(state) => state.game.drawnCards, (state) => state.game.completedCards, (state) => state.game.cardsRemaining],
    (drawnCards, completedCards, cardsRemaining) => {
      const totalCards = drawnCards.length + cardsRemaining;
      const progress = totalCards > 0 ? (drawnCards.length / totalCards) * 100 : 0;
      const completionRate = drawnCards.length > 0 ? (completedCards.length / drawnCards.length) * 100 : 0;

      return {
        progress: Math.round(progress),
        completed: completedCards.length,
        total: totalCards,
        drawn: drawnCards.length,
        completionRate: Math.round(completionRate)
      };
    }
  ),

  getCanDrawCard: createSelector(
    [(state) => state.game.isSessionActive, (state) => state.game.cardsRemaining, (state) => state.game.currentCard],
    (isSessionActive, cardsRemaining, currentCard) => {
      return isSessionActive && cardsRemaining > 0 && !currentCard;
    }
  ),

  getSessionDuration: createSelector(
    [(state) => state.game.currentSession],
    (currentSession) => {
      if (!currentSession?.startedAt) return 0;

      const startTime = new Date(currentSession.startedAt);
      const now = new Date();
      return Math.floor((now - startTime) / 1000 / 60); // Duration in minutes
    }
  ),

  getCardStats: createSelector(
    [(state) => state.game.drawnCards, (state) => state.game.completedCards, (state) => state.game.skippedCards],
    (drawnCards, completedCards, skippedCards) => ({
      drawn: drawnCards.length,
      completed: completedCards.length,
      skipped: skippedCards.length,
      skipRate: drawnCards.length > 0 ? (skippedCards.length / drawnCards.length) * 100 : 0
    })
  ),

  getNextLevel: createSelector(
    [(state) => state.game.currentLevel, (state) => state.game.completedCards],
    (currentLevel, completedCards) => {
      const cardsPerLevel = 5; // Could be configurable
      const completedInCurrentLevel = completedCards.length % cardsPerLevel;
      const cardsNeeded = cardsPerLevel - completedInCurrentLevel;

      return {
        current: currentLevel,
        next: Math.min(currentLevel + 1, 4),
        cardsNeeded: currentLevel < 4 ? cardsNeeded : 0,
        progress: (completedInCurrentLevel / cardsPerLevel) * 100
      };
    }
  ),

  getSessionSummary: createSelector(
    [
      (state) => state.game.currentSession,
      (state) => state.game.drawnCards,
      (state) => state.game.completedCards,
      (state) => state.game.skippedCards,
      (state) => state.game.currentLevel
    ],
    (currentSession, drawnCards, completedCards, skippedCards, currentLevel) => {
      if (!currentSession) return null;

      const duration = currentSession.startedAt
        ? Math.floor((new Date() - new Date(currentSession.startedAt)) / 1000 / 60)
        : 0;

      return {
        sessionId: currentSession.id,
        relationshipType: currentSession.relationshipType,
        duration,
        currentLevel,
        stats: {
          drawn: drawnCards.length,
          completed: completedCards.length,
          skipped: skippedCards.length,
          completionRate: drawnCards.length > 0 ? (completedCards.length / drawnCards.length) * 100 : 0
        }
      };
    }
  ),

  getIsSessionComplete: createSelector(
    [(state) => state.game.cardsRemaining, (state) => state.game.currentLevel],
    (cardsRemaining, currentLevel) => {
      return cardsRemaining === 0 || currentLevel >= 4;
    }
  ),

  getSessionWarnings: createSelector(
    [(state) => state.game.cardsRemaining, (state) => state.game.skippedCards],
    (cardsRemaining, skippedCards) => {
      const warnings = [];

      if (cardsRemaining <= 5 && cardsRemaining > 0) {
        warnings.push(`Only ${cardsRemaining} cards remaining`);
      }

      if (skippedCards.length > 0) {
        const skipRate = (skippedCards.length / (skippedCards.length + 10)) * 100; // Approximate
        if (skipRate > 30) {
          warnings.push('High skip rate - consider adjusting difficulty');
        }
      }

      return warnings;
    }
  )
};
