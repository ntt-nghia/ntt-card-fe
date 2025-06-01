import { createSelector } from '@reduxjs/toolkit';

export const userSelectors = {
  getUserState: (state) => state.user,

  getProfile: (state) => state.user.profile,

  getStatistics: (state) => state.user.statistics,

  getPreferences: (state) => state.user.preferences,

  getUnlockedDecks: (state) => state.user.unlockedDecks,

  getPurchaseHistory: (state) => state.user.purchaseHistory,

  getIsLoading: (state) => state.user.isLoading,

  getIsUpdating: (state) => state.user.isUpdating,

  getError: (state) => state.user.error,

  getStatsLoading: (state) => state.user.statsLoading,

  getStatsError: (state) => state.user.statsError,

  // Computed selectors
  getUserLanguage: (state) => state.user.profile?.language || 'en',

  getTotalSessions: (state) => state.user.statistics?.totalSessions || 0,

  getFavoriteRelationshipType: (state) => state.user.statistics?.favoriteRelationshipType,

  getAverageSessionDuration: (state) => state.user.statistics?.averageSessionDuration || 0,

  getRelationshipTypeUsage: (state) => state.user.statistics?.relationshipTypeUsage || {},

  getUnlockedDeckIds: (state) => state.user.unlockedDecks?.map((deck) => deck.id) || [],

  getTotalSpent: (state) => {
    const purchases = state.user.purchaseHistory || [];
    return purchases.reduce((total, purchase) => total + (purchase.amount || 0), 0);
  },

  getRecentPurchases: (state) => {
    const purchases = state.user.purchaseHistory || [];
    return purchases
      .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
      .slice(0, 5);
  },

  hasUnlockedDeck: (state, deckId) => {
    const unlockedIds = state.user.unlockedDecks?.map((deck) => deck.id) || [];
    return unlockedIds.includes(deckId);
  },

  getUserProgress: createSelector([(state) => state.user.statistics], (statistics) => {
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
        percentage: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0,
      })),
      experienceLevel:
        totalSessions < 5 ? 'beginner' : totalSessions < 20 ? 'intermediate' : 'advanced',
    };
  }),

  getUserAchievements: createSelector(
    [(state) => state.user.statistics, (state) => state.user.unlockedDecks],
    (statistics, unlockedDecks) => {
      const achievements = [];

      if (statistics?.totalSessions >= 1) {
        achievements.push({ id: 'first_session', name: 'First Connection', unlocked: true });
      }

      if (statistics?.totalSessions >= 10) {
        achievements.push({ id: 'regular_player', name: 'Regular Player', unlocked: true });
      }

      if (statistics?.totalSessions >= 50) {
        achievements.push({ id: 'connection_master', name: 'Connection Master', unlocked: true });
      }

      if (unlockedDecks?.length >= 5) {
        achievements.push({ id: 'deck_collector', name: 'Deck Collector', unlocked: true });
      }

      const relationshipTypes = Object.keys(statistics?.relationshipTypeUsage || {});
      if (relationshipTypes.length >= 3) {
        achievements.push({ id: 'versatile_host', name: 'Versatile Host', unlocked: true });
      }

      return achievements;
    }
  ),

  getSpendingInsights: createSelector(
    [(state) => state.user.purchaseHistory],
    (purchaseHistory) => {
      if (!purchaseHistory || purchaseHistory.length === 0) {
        return { totalSpent: 0, averagePerPurchase: 0, purchaseCount: 0, lastPurchase: null };
      }

      const totalSpent = purchaseHistory.reduce((sum, purchase) => sum + (purchase.amount || 0), 0);
      const averagePerPurchase = totalSpent / purchaseHistory.length;
      const lastPurchase = purchaseHistory.sort(
        (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)
      )[0];

      return {
        totalSpent,
        averagePerPurchase: Math.round(averagePerPurchase * 100) / 100,
        purchaseCount: purchaseHistory.length,
        lastPurchase,
      };
    }
  ),

  getRecommendations: createSelector(
    [(state) => state.user.statistics, (state) => state.user.unlockedDecks],
    (statistics, unlockedDecks) => {
      const recommendations = [];

      if (!statistics?.totalSessions) {
        recommendations.push({
          type: 'start_playing',
          message: 'Start your first session to begin building connections!',
          action: 'start_session',
        });
        return recommendations;
      }

      const favoriteType = statistics.favoriteRelationshipType;
      const relationshipUsage = statistics.relationshipTypeUsage || {};

      // Recommend trying new relationship types
      const untried = [
        'friends',
        'colleagues',
        'new_couples',
        'established_couples',
        'family',
      ].filter((type) => !relationshipUsage[type]);

      if (untried.length > 0) {
        recommendations.push({
          type: 'try_new_type',
          message: `Try a ${untried[0].replace('_', ' ')} session for a new experience!`,
          action: 'start_session',
          relationshipType: untried[0],
        });
      }

      // Recommend premium decks if user has many sessions but few decks
      if (statistics.totalSessions >= 10 && unlockedDecks?.length < 3) {
        recommendations.push({
          type: 'upgrade_deck',
          message: 'Unlock premium decks for deeper connection experiences!',
          action: 'browse_decks',
        });
      }

      return recommendations;
    }
  ),
};
