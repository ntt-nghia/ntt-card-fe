import { apiMethods, ENDPOINTS } from './api';

// Deck service functions
export const deckService = {
  // Get all decks with optional filters
  getAllDecks: async (filters = {}) => {
    const params = new URLSearchParams();

    // Add filters as query parameters
    if (filters.relationshipType) params.append('relationshipType', filters.relationshipType);
    if (filters.type) params.append('type', filters.type);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.search) params.append('search', filters.search);

    const url = params.toString() ? `${ENDPOINTS.DECKS.LIST}?${params}` : ENDPOINTS.DECKS.LIST;
    const response = await apiMethods.get(url);
    return response.data;
  },

  // Get deck by ID
  getDeckById: async (deckId) => {
    const response = await apiMethods.get(ENDPOINTS.DECKS.GET(deckId));
    return response.data;
  },

  // Get deck cards
  getDeckCards: async (deckId, filters = {}) => {
    const params = new URLSearchParams();

    if (filters.connectionLevel) params.append('connectionLevel', filters.connectionLevel);
    if (filters.type) params.append('type', filters.type);
    if (filters.language) params.append('language', filters.language);

    const url = params.toString()
      ? `${ENDPOINTS.DECKS.CARDS(deckId)}?${params}`
      : ENDPOINTS.DECKS.CARDS(deckId);

    const response = await apiMethods.get(url);
    return response.data;
  },

  // Unlock/purchase a deck
  unlockDeck: async (deckId, purchaseData) => {
    const response = await apiMethods.post(ENDPOINTS.DECKS.UNLOCK(deckId), purchaseData);
    return response.data;
  },

  // Get deck statistics
  getDeckStatistics: async (deckId) => {
    const response = await apiMethods.get(ENDPOINTS.DECKS.STATISTICS(deckId));
    return response.data;
  },

  // Get decks by relationship type (convenience method)
  getDecksByRelationshipType: async (relationshipType) => {
    return await deckService.getAllDecks({ relationshipType });
  },

  // Get free decks only (convenience method)
  getFreeDecks: async (relationshipType = null) => {
    const filters = { type: 'FREE' };
    if (relationshipType) filters.relationshipType = relationshipType;
    return await deckService.getAllDecks(filters);
  },

  // Get premium decks only (convenience method)
  getPremiumDecks: async (relationshipType = null) => {
    const filters = { type: 'PREMIUM' };
    if (relationshipType) filters.relationshipType = relationshipType;
    return await deckService.getAllDecks(filters);
  },

  // Search decks
  searchDecks: async (query, filters = {}) => {
    return await deckService.getAllDecks({
      ...filters,
      search: query,
    });
  },
};

// Export individual functions for easier importing
export const getAllDecks = deckService.getAllDecks;
export const getDeckById = deckService.getDeckById;
export const getDeckCards = deckService.getDeckCards;
export const unlockDeck = deckService.unlockDeck;
export const getDeckStatistics = deckService.getDeckStatistics;
export const getDecksByRelationshipType = deckService.getDecksByRelationshipType;
export const getFreeDecks = deckService.getFreeDecks;
export const getPremiumDecks = deckService.getPremiumDecks;
export const searchDecks = deckService.searchDecks;
