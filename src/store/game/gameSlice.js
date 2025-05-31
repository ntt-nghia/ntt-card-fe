import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Current session
  currentSession: null,
  currentCard: null,

  // Session state
  isSessionActive: false,
  currentLevel: 1,
  drawnCards: [],
  completedCards: [],
  skippedCards: [],
  cardsRemaining: 0,

  // UI state
  isLoading: false,
  isDrawing: false,
  error: null,

  // Session configuration
  relationshipType: null,
  selectedDeckIds: [],
  language: 'en',
  configuration: {},

  // Statistics
  sessionStats: null,
  sessionHistory: [],
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Session management
    startSessionRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    startSessionSuccess: (state, action) => {
      const { session } = action.payload;
      state.currentSession = session;
      state.isSessionActive = true;
      state.relationshipType = session.relationshipType;
      state.selectedDeckIds = session.selectedDeckIds;
      state.language = session.language;
      state.configuration = session.configuration;
      state.currentLevel = session.currentLevel;
      state.drawnCards = session.drawnCards || [];
      state.completedCards = session.completedCards || [];
      state.skippedCards = session.skippedCards || [];
      state.cardsRemaining = session.availableCardPool?.length || 0;
      state.isLoading = false;
      state.error = null;
    },
    startSessionFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Get session
    getSessionRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getSessionSuccess: (state, action) => {
      const { session } = action.payload;
      state.currentSession = session;
      state.isSessionActive = session.status === 'active';
      state.currentLevel = session.currentLevel;
      state.drawnCards = session.drawnCards || [];
      state.completedCards = session.completedCards || [];
      state.skippedCards = session.skippedCards || [];
      state.isLoading = false;
      state.error = null;
    },
    getSessionFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Card drawing
    drawCardRequest: (state) => {
      state.isDrawing = true;
      state.error = null;
    },
    drawCardSuccess: (state, action) => {
      const { card, currentLevel, cardsRemaining } = action.payload;
      state.currentCard = card;
      state.currentLevel = currentLevel;
      state.cardsRemaining = cardsRemaining;
      state.drawnCards.push(card.id);
      state.isDrawing = false;
      state.error = null;
    },
    drawCardFailure: (state, action) => {
      state.isDrawing = false;
      state.error = action.payload;
    },

    // Card actions
    completeCardRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    completeCardSuccess: (state, action) => {
      const { cardId, currentLevel, completedCount } = action.payload;
      state.completedCards.push(cardId);
      state.currentLevel = currentLevel;
      state.currentCard = null;
      state.isLoading = false;
      state.error = null;
    },
    completeCardFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    skipCardRequest: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    skipCardSuccess: (state, action) => {
      const { cardId, skippedCount } = action.payload;
      state.skippedCards.push(cardId);
      state.currentCard = null;
      state.isLoading = false;
      state.error = null;
    },
    skipCardFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // End session
    endSessionRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    endSessionSuccess: (state, action) => {
      const { statistics } = action.payload;
      state.sessionStats = statistics;
      state.isSessionActive = false;
      state.currentCard = null;
      state.currentSession = null;
      state.isLoading = false;
      state.error = null;
    },
    endSessionFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Session history
    getSessionHistoryRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getSessionHistorySuccess: (state, action) => {
      state.sessionHistory = action.payload.sessions;
      state.isLoading = false;
      state.error = null;
    },
    getSessionHistoryFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Session statistics
    getSessionStatsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getSessionStatsSuccess: (state, action) => {
      state.sessionStats = action.payload.statistics;
      state.isLoading = false;
      state.error = null;
    },
    getSessionStatsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Clear session
    clearSession: (state) => {
      state.currentSession = null;
      state.currentCard = null;
      state.isSessionActive = false;
      state.currentLevel = 1;
      state.drawnCards = [];
      state.completedCards = [];
      state.skippedCards = [];
      state.cardsRemaining = 0;
      state.relationshipType = null;
      state.selectedDeckIds = [];
      state.configuration = {};
      state.sessionStats = null;
      state.error = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const gameActions = gameSlice.actions;
export default gameSlice.reducer;
