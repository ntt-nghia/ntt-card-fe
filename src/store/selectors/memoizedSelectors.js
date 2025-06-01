import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect';
import { isEqual } from 'lodash';

// Create a selector that uses deep equality check
const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual
);

// Memoized game selectors
export const getMemoizedGameState = createSelector(
  [(state) => state.game],
  (game) => game
);

export const getMemoizedSessionProgress = createSelector(
  [
    (state) => state.game.drawnCards,
    (state) => state.game.completedCards,
    (state) => state.game.cardsRemaining
  ],
  (drawnCards, completedCards, cardsRemaining) => {
    const totalCards = drawnCards.length + cardsRemaining;
    const progress = totalCards > 0 ? (drawnCards.length / totalCards) * 100 : 0;

    return {
      progress: Math.round(progress),
      completed: completedCards.length,
      total: totalCards,
      remaining: cardsRemaining
    };
  }
);

export const getMemoizedUserStats = createDeepEqualSelector(
  [(state) => state.user.statistics],
  (statistics) => {
    if (!statistics) return null;

    const totalSessions = statistics.totalSessions || 0;
    const relationshipUsage = statistics.relationshipTypeUsage || {};

    return {
      totalSessions,
      averageDuration: statistics.averageSessionDuration || 0,
      favoriteType: statistics.favoriteRelationshipType,
      relationshipBreakdown: Object.entries(relationshipUsage).map(([type, count]) => ({
        type,
        count,
        percentage: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0
      })),
      experienceLevel: totalSessions < 5 ? 'beginner' : totalSessions < 20 ? 'intermediate' : 'expert'
    };
  }
);

export const getMemoizedDeckRecommendations = createSelector(
  [
    (state) => state.deck.filteredDecks,
    (state) => state.user.statistics
  ],
  (decks, statistics) => {
    if (!statistics || !decks.length) return [];

    const favoriteType = statistics.favoriteRelationshipType;
    const experience = statistics.totalSessions || 0;

    return decks
      .filter(deck => {
        if (favoriteType && deck.relationshipType === favoriteType) return true;
        if (experience < 5 && deck.tier === 'FREE') return true;
        if (experience >= 10 && deck.tier === 'PREMIUM') return true;
        return false;
      })
      .slice(0, 5);
  }
);
