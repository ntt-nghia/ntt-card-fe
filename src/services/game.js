import { apiMethods, ENDPOINTS } from './api';

// Game session service functions
export const gameService = {
  // Start new session
  startSession: async (sessionData) => {
    const response = await apiMethods.post(ENDPOINTS.SESSIONS.START, sessionData);
    return response.data;
  },

  // Get active sessions for user
  getActiveSessions: async () => {
    const response = await apiMethods.get(ENDPOINTS.SESSIONS.ACTIVE);
    return response.data;
  },

  // Get session by ID
  getSession: async (sessionId) => {
    const response = await apiMethods.get(ENDPOINTS.SESSIONS.GET(sessionId));
    return response.data;
  },

  // Draw next card
  drawCard: async (sessionId) => {
    const response = await apiMethods.get(ENDPOINTS.SESSIONS.DRAW_CARD(sessionId));
    return response.data;
  },

  // Complete a card
  completeCard: async (sessionId, cardId) => {
    const response = await apiMethods.post(ENDPOINTS.SESSIONS.COMPLETE_CARD(sessionId), {
      cardId
    });
    return response.data;
  },

  // Skip a card
  skipCard: async (sessionId, cardId) => {
    const response = await apiMethods.post(ENDPOINTS.SESSIONS.SKIP_CARD(sessionId), {
      cardId
    });
    return response.data;
  },

  // End session
  endSession: async (sessionId) => {
    const response = await apiMethods.post(ENDPOINTS.SESSIONS.END(sessionId));
    return response.data;
  },

  // Get session statistics
  getSessionStatistics: async (sessionId) => {
    const response = await apiMethods.get(ENDPOINTS.SESSIONS.STATISTICS(sessionId));
    return response.data;
  },
};

// Export individual functions for easier importing
export const startSession = gameService.startSession;
export const getActiveSessions = gameService.getActiveSessions;
export const getSession = gameService.getSession;
export const drawCard = gameService.drawCard;
export const completeCard = gameService.completeCard;
export const skipCard = gameService.skipCard;
export const endSession = gameService.endSession;
export const getSessionStatistics = gameService.getSessionStatistics;
