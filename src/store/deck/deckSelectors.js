import {createSelector} from "@reduxjs/toolkit";

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

  getDecksByValue: createSelector(
    [(state) => state.deck.filteredDecks],
    (decks) => {
      return decks
        .filter(deck => deck.price !== undefined)
        .sort((a, b) => {
          // Sort by value: free first, then by price
          if (a.tier === 'FREE' && b.tier === 'PREMIUM') return -1;
          if (a.tier === 'PREMIUM' && b.tier === 'FREE') return 1;
          return (a.price || 0) - (b.price || 0);
        });
    }
  ),

  getDeckRecommendations: createSelector(
    [
      (state) => state.deck.filteredDecks,
      (state, userStatistics) => userStatistics
    ],
    (decks, userStatistics) => {
      if (!userStatistics) return decks.slice(0, 3);

      const favoriteType = userStatistics.favoriteRelationshipType;
      const experience = userStatistics.totalSessions || 0;

      let recommended = decks.filter(deck => {
        // Recommend based on user's favorite type
        if (favoriteType && deck.relationshipType === favoriteType) return true;

        // For beginners, recommend free decks
        if (experience < 5 && deck.tier === 'FREE') return true;

        // For experienced users, recommend premium decks
        if (experience >= 10 && deck.tier === 'PREMIUM') return true;

        return false;
      });

      // If no specific matches, return popular decks
      if (recommended.length === 0) {
        recommended = decks
          .sort((a, b) => (b.statistics?.sessionsPlayed || 0) - (a.statistics?.sessionsPlayed || 0))
          .slice(0, 3);
      }

      return recommended.slice(0, 5);
    }
  ),

  getDecksByDifficulty: createSelector(
    [(state) => state.deck.filteredDecks],
    (decks) => {
      const grouped = {
        beginner: [],
        intermediate: [],
        advanced: []
      };

      decks.forEach(deck => {
        const difficulty = deck.difficulty || 'intermediate';
        if (grouped[difficulty]) {
          grouped[difficulty].push(deck);
        }
      });

      return grouped;
    }
  ),

  getUnlockedValue: createSelector(
    [(state) => state.deck.filteredDecks],
    (decks) => {
      const unlockedDecks = decks.filter(deck => deck.isUnlocked || deck.tier === 'FREE');
      const totalValue = unlockedDecks.reduce((sum, deck) => sum + (deck.price || 0), 0);
      const totalCards = unlockedDecks.reduce((sum, deck) => sum + (deck.cardCount?.total || 0), 0);

      return {
        deckCount: unlockedDecks.length,
        totalValue,
        totalCards,
        averageValue: unlockedDecks.length > 0 ? totalValue / unlockedDecks.length : 0
      };
    }
  ),

  getSearchResults: createSelector(
    [
      (state) => state.deck.filteredDecks,
      (state) => state.deck.filters.searchQuery
    ],
    (decks, searchQuery) => {
      if (!searchQuery || searchQuery.length < 2) return decks;

      const query = searchQuery.toLowerCase();

      return decks.filter(deck => {
        const name = deck.name?.en?.toLowerCase() || '';
        const description = deck.description?.en?.toLowerCase() || '';
        const tags = deck.tags?.join(' ').toLowerCase() || '';
        const relationshipType = deck.relationshipType?.toLowerCase() || '';

        return name.includes(query) ||
          description.includes(query) ||
          tags.includes(query) ||
          relationshipType.includes(query);
      });
    }
  )
};
