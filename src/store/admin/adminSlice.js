import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Cards state
  cards: [],
  generatedCards: [],
  currentCard: null,

  // Pagination
  pagination: {
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  },

  // Filters
  filters: {
    relationshipType: '',
    connectionLevel: '',
    type: '',
    status: '',
    tier: '',
    searchQuery: '',
    deckId: '',
    language: 'en',
  },

  // Decks state
  decks: [],
  currentDeck: null,

  // Users state
  users: [],
  currentUser: null,

  // Analytics state
  analytics: null,
  generationAnalytics: null,
  deckAnalytics: {},

  // UI state
  isLoading: false,
  isGenerating: false,
  isSaving: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Generic actions
    clearError: (state) => {
      state.error = null;
    },

    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Card management - Request actions
    getAllCardsRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },

    getAllCardsSuccess: (state, action) => {
      state.isLoading = false;
      const { cards, pagination, append = false } = action.payload;

      if (append) {
        state.cards = [...state.cards, ...cards];
      } else {
        state.cards = cards;
      }

      state.pagination = { ...state.pagination, ...pagination };
    },

    getAllCardsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Single card actions
    getCardRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    getCardSuccess: (state, action) => {
      state.isLoading = false;
      state.currentCard = action.payload;
    },

    getCardFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Create card
    createCardRequest: (state) => {
      state.isSaving = true;
      state.error = null;
    },

    createCardSuccess: (state, action) => {
      state.isSaving = false;
      state.cards.unshift(action.payload);
      state.pagination.total += 1;
    },

    createCardFailure: (state, action) => {
      state.isSaving = false;
      state.error = action.payload;
    },

    // Update card
    updateCardRequest: (state) => {
      state.isSaving = true;
      state.error = null;
    },

    updateCardSuccess: (state, action) => {
      state.isSaving = false;
      const { cardId, updates } = action.payload;

      // Update in cards list
      const cardIndex = state.cards.findIndex(card => card.id === cardId);
      if (cardIndex !== -1) {
        state.cards[cardIndex] = { ...state.cards[cardIndex], ...updates };
      }

      // Update in generated cards if it exists there
      const genCardIndex = state.generatedCards.findIndex(card => card.id === cardId);
      if (genCardIndex !== -1) {
        state.generatedCards[genCardIndex] = { ...state.generatedCards[genCardIndex], ...updates };
      }

      // Update current card if it's the same
      if (state.currentCard?.id === cardId) {
        state.currentCard = { ...state.currentCard, ...updates };
      }
    },

    updateCardFailure: (state, action) => {
      state.isSaving = false;
      state.error = action.payload;
    },

    // Delete card
    deleteCardRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    deleteCardSuccess: (state, action) => {
      state.isLoading = false;
      const cardId = action.payload;

      // Remove from cards list
      state.cards = state.cards.filter(card => card.id !== cardId);

      // Remove from generated cards
      state.generatedCards = state.generatedCards.filter(card => card.id !== cardId);

      // Clear current card if it's the deleted one
      if (state.currentCard?.id === cardId) {
        state.currentCard = null;
      }

      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },

    deleteCardFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Bulk delete cards
    bulkDeleteCardsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    bulkDeleteCardsSuccess: (state, action) => {
      state.isLoading = false;
      const cardIds = action.payload;

      // Remove from cards list
      state.cards = state.cards.filter(card => !cardIds.includes(card.id));

      // Remove from generated cards
      state.generatedCards = state.generatedCards.filter(card => !cardIds.includes(card.id));

      state.pagination.total = Math.max(0, state.pagination.total - cardIds.length);
    },

    bulkDeleteCardsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Card generation
    generateCardsRequest: (state) => {
      state.isGenerating = true;
      state.error = null;
    },

    generateCardsSuccess: (state, action) => {
      state.isGenerating = false;
      state.generatedCards = action.payload;
    },

    generateCardsFailure: (state, action) => {
      state.isGenerating = false;
      state.error = action.payload;
    },

    // Batch generation
    batchGenerateCardsRequest: (state) => {
      state.isGenerating = true;
      state.error = null;
    },

    batchGenerateCardsSuccess: (state, action) => {
      state.isGenerating = false;
      // action.payload could contain results from multiple generations
      const allGeneratedCards = action.payload.reduce((acc, result) => {
        return [...acc, ...(result.cards || [])];
      }, []);
      state.generatedCards = allGeneratedCards;
    },

    batchGenerateCardsFailure: (state, action) => {
      state.isGenerating = false;
      state.error = action.payload;
    },

    // Clear generated cards
    clearGeneratedCards: (state) => {
      state.generatedCards = [];
    },

    // Deck management
    getAllDecksRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    getAllDecksSuccess: (state, action) => {
      state.isLoading = false;
      state.decks = action.payload;
    },

    getAllDecksFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Analytics
    getAnalyticsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    getAnalyticsSuccess: (state, action) => {
      state.isLoading = false;
      state.analytics = action.payload;
    },

    getAnalyticsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Generation analytics
    getGenerationAnalyticsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    getGenerationAnalyticsSuccess: (state, action) => {
      state.isLoading = false;
      state.generationAnalytics = action.payload;
    },

    getGenerationAnalyticsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // User management
    getAllUsersRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    getAllUsersSuccess: (state, action) => {
      state.isLoading = false;
      state.users = action.payload;
    },

    getAllUsersFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const adminActions = adminSlice.actions;
export default adminSlice.reducer;
