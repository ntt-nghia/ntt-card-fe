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

  getUnlockedDeckIds: (state) => state.user.unlockedDecks?.map(deck => deck.id) || [],

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
    const unlockedIds = state.user.unlockedDecks?.map(deck => deck.id) || [];
    return unlockedIds.includes(deckId);
  },
};
