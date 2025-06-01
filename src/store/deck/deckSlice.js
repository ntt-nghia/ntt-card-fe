import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Deck data
  allDecks: [],
  currentDeck: null,
  deckCards: [],

  // Filtering and search
  filteredDecks: [],
  filters: {
    relationshipType: null,
    tier: null, // FREE or PREMIUM
    searchQuery: '',
  },

  // UI state
  isLoading: false,
  isLoadingCards: false,
  isUnlocking: false,
  error: null,

  // Deck statistics
  deckStatistics: {},

  // Pagination for large deck lists
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    hasMore: true,
  },
};

const deckSlice = createSlice({
  name: 'deck',
  initialState,
  reducers: {
    // Get all decks
    getAllDecksRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
      if (action.payload?.filters) {
        state.filters = { ...state.filters, ...action.payload.filters };
      }
    },
    getAllDecksSuccess: (state, action) => {
      const { decks, total, page } = action.payload;

      if (page === 1) {
        state.allDecks = decks;
        state.filteredDecks = decks;
      } else {
        // Append for pagination
        state.allDecks = [...state.allDecks, ...decks];
        state.filteredDecks = [...state.filteredDecks, ...decks];
      }

      state.pagination.total = total || decks.length;
      state.pagination.page = page || 1;
      state.pagination.hasMore = decks.length >= state.pagination.limit;
      state.isLoading = false;
      state.error = null;
    },
    getAllDecksFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Get deck by ID
    getDeckByIdRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getDeckByIdSuccess: (state, action) => {
      state.currentDeck = action.payload.deck;
      state.isLoading = false;
      state.error = null;
    },
    getDeckByIdFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Get deck cards
    getDeckCardsRequest: (state) => {
      state.isLoadingCards = true;
      state.error = null;
    },
    getDeckCardsSuccess: (state, action) => {
      state.deckCards = action.payload.cards;
      state.isLoadingCards = false;
      state.error = null;
    },
    getDeckCardsFailure: (state, action) => {
      state.isLoadingCards = false;
      state.error = action.payload;
    },

    // Unlock deck
    unlockDeckRequest: (state) => {
      state.isUnlocking = true;
      state.error = null;
    },
    unlockDeckSuccess: (state, action) => {
      const { deckId, unlockedDecks } = action.payload;

      // Update the deck in allDecks to show it's unlocked
      state.allDecks = state.allDecks.map((deck) =>
        deck.id === deckId ? { ...deck, isUnlocked: true, hasAccess: true } : deck
      );

      // Update filtered decks as well
      state.filteredDecks = state.filteredDecks.map((deck) =>
        deck.id === deckId ? { ...deck, isUnlocked: true, hasAccess: true } : deck
      );

      // Update current deck if it's the one being unlocked
      if (state.currentDeck?.id === deckId) {
        state.currentDeck = {
          ...state.currentDeck,
          isUnlocked: true,
          hasAccess: true,
        };
      }

      state.isUnlocking = false;
      state.error = null;
    },
    unlockDeckFailure: (state, action) => {
      state.isUnlocking = false;
      state.error = action.payload;
    },

    // Get deck statistics
    getDeckStatisticsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getDeckStatisticsSuccess: (state, action) => {
      const { deckId, statistics } = action.payload;
      state.deckStatistics[deckId] = statistics;
      state.isLoading = false;
      state.error = null;
    },
    getDeckStatisticsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Filter and search
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset pagination when filters change
    },

    applyFilters: (state) => {
      let filtered = [...state.allDecks];

      // Filter by relationship type
      if (state.filters.relationshipType) {
        filtered = filtered.filter(
          (deck) => deck.relationshipType === state.filters.relationshipType
        );
      }

      // Filter by deck tier (FREE/PREMIUM)
      if (state.filters.tier) {
        filtered = filtered.filter((deck) => deck.tier === state.filters.tier);
      }

      // Filter by search query
      if (state.filters.searchQuery) {
        const query = state.filters.searchQuery.toLowerCase();
        filtered = filtered.filter((deck) => {
          const name = deck.name?.en?.toLowerCase() || '';
          const description = deck.description?.en?.toLowerCase() || '';
          const tags = deck.tags?.join(' ').toLowerCase() || '';

          return name.includes(query) || description.includes(query) || tags.includes(query);
        });
      }

      state.filteredDecks = filtered;
    },

    // Pagination
    loadMoreDecks: (state) => {
      if (state.pagination.hasMore && !state.isLoading) {
        state.pagination.page += 1;
      }
    },

    resetPagination: (state) => {
      state.pagination = {
        page: 1,
        limit: 12,
        total: 0,
        hasMore: true,
      };
    },

    // Clear deck data
    clearCurrentDeck: (state) => {
      state.currentDeck = null;
      state.deckCards = [];
    },

    clearDeckCards: (state) => {
      state.deckCards = [];
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
    },

    // Reset deck state
    resetDeckState: (state) => {
      return { ...initialState };
    },
  },
});

export const deckActions = deckSlice.actions;
export default deckSlice.reducer;
