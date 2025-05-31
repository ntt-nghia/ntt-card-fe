export const deckSelectors = {
  getDeckState: (state) => state.deck,

  getAllDecks: (state) => state.deck.allDecks,

  getFilteredDecks: (state) => state.deck.filteredDecks,

  getCurrentDeck: (state) => state.deck.currentDeck,

  getDeckCards: (state) => state.deck.deckCards,

  getFilters: (state) => state.deck.filters,

  getPagination: (state) => state.deck.pagination,

  getCurrentPage: (state) => state.deck.pagination.page,

  getHasMore: (state) => state.deck.pagination.hasMore,

  getTotalDecks: (state) => state.deck.pagination.total,

  getIsLoading: (state) => state.deck.isLoading,

  getIsLoadingCards: (state) => state.deck.isLoadingCards,

  getIsUnlocking: (state) => state.deck.isUnlocking,

  getError: (state) => state.deck.error,

  getDeckStatistics: (state) => state.deck.deckStatistics,

  // Computed selectors
  getDecksByRelationshipType: (state, relationshipType) => {
    return state.deck.filteredDecks.filter(deck =>
      deck.relationshipType === relationshipType
    );
  },

  getFreeDecks: (state) => {
    return state.deck.filteredDecks.filter(deck => deck.tier === 'FREE');
  },

  getPremiumDecks: (state) => {
    return state.deck.filteredDecks.filter(deck => deck.tier === 'PREMIUM');
  },

  getUnlockedDecks: (state) => {
    return state.deck.filteredDecks.filter(deck => deck.isUnlocked === true);
  },

  getLockedDecks: (state) => {
    return state.deck.filteredDecks.filter(deck =>
      deck.tier === 'PREMIUM' && deck.isUnlocked !== true
    );
  },

  getDeckById: (state, deckId) => {
    return state.deck.allDecks.find(deck => deck.id === deckId);
  },

  getDeckStatisticsById: (state, deckId) => {
    return state.deck.deckStatistics[deckId];
  },

  getSearchQuery: (state) => state.deck.filters.searchQuery,

  getSelectedRelationshipType: (state) => state.deck.filters.relationshipType,

  getSelectedDeckTier: (state) => state.deck.filters.tier,

  // Advanced computed selectors
  getDecksByPrice: (state) => {
    const decks = [...state.deck.filteredDecks];
    return decks.sort((a, b) => (a.price || 0) - (b.price || 0));
  },

  getDecksByPopularity: (state) => {
    const decks = [...state.deck.filteredDecks];
    return decks.sort((a, b) => {
      const aStats = state.deck.deckStatistics[a.id];
      const bStats = state.deck.deckStatistics[b.id];
      const aSessions = aStats?.sessionsPlayed || 0;
      const bSessions = bStats?.sessionsPlayed || 0;
      return bSessions - aSessions;
    });
  },

  getDecksByRating: (state) => {
    const decks = [...state.deck.filteredDecks];
    return decks.sort((a, b) => {
      const aRating = a.statistics?.rating || 0;
      const bRating = b.statistics?.rating || 0;
      return bRating - aRating;
    });
  },

  getRecommendedDecks: (state, userStatistics) => {
    const decks = state.deck.filteredDecks;
    const favoriteType = userStatistics?.favoriteRelationshipType;

    if (!favoriteType) return decks.slice(0, 3);

    // Recommend decks of user's favorite relationship type
    const favoriteTypeDecks = decks.filter(deck =>
      deck.relationshipType === favoriteType
    );

    return favoriteTypeDecks.slice(0, 3);
  },

  hasAccessToDeck: (state, deckId) => {
    const deck = state.deck.allDecks.find(d => d.id === deckId);
    return deck?.hasAccess === true || deck?.tier === 'FREE';
  },

  canPlayDeck: (state, deckId) => {
    const deck = state.deck.allDecks.find(d => d.id === deckId);
    return deck?.hasAccess === true && deck?.status === 'active';
  },
};
