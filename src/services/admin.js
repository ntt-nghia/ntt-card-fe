import { apiMethods, ENDPOINTS } from './api';

class AdminService {

  /**
   * Generate AI-powered cards
   * @param {Object} params - Generation parameters
   * @returns {Promise} API response
   */
  async generateCards(params) {
    const {
      relationshipType,
      connectionLevel,
      count = 5,
      theta = 0.5,
      targetLanguages = ['en'],
      deckId,
      preview = false,
      batchMode = false,
    } = params;

    return apiMethods.post(ENDPOINTS.ADMIN.CARDS_GENERATE, {
      relationshipType,
      connectionLevel,
      count,
      theta,
      targetLanguages,
      deckId,
      preview,
      batchMode,
    });
  }

  /**
   * Batch generate cards for multiple configurations
   * @param {Array} configurations - Array of generation configurations
   * @param {number} globalTheta - Global theta value
   * @returns {Promise} API response
   */
  async batchGenerateCards(configurations, globalTheta = 0.5) {
    return apiMethods.post('/v1/admin/batch-generate-cards', {
      configurations,
      globalTheta,
    });
  }

  /**
   * Get AI generation analytics
   * @returns {Promise} API response
   */
  async getGenerationAnalytics() {
    return apiMethods.get('/v1/admin/generation-analytics');
  }
  /**
   * Get all decks for admin
   * @param {Object} filters - Optional filters
   * @returns {Promise} API response
   */
  async getAllDecks(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiMethods.get(`${ENDPOINTS.ADMIN.DECKS}?${queryParams}`);
  }

  /**
   * Create a new deck
   * @param {Object} deckData - Deck information
   * @returns {Promise} API response
   */
  async createDeck(deckData) {
    return apiMethods.post(ENDPOINTS.ADMIN.DECKS, deckData);
  }

  /**
   * Update a deck
   * @param {string} deckId - Deck ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise} API response
   */
  async updateDeck(deckId, updates) {
    return apiMethods.patch(`${ENDPOINTS.ADMIN.DECKS}/${deckId}`, updates);
  }

  /**
   * Delete a deck
   * @param {string} deckId - Deck ID
   * @returns {Promise} API response
   */
  async deleteDeck(deckId) {
    return apiMethods.delete(`${ENDPOINTS.ADMIN.DECKS}/${deckId}`);
  }
  /**
   * Create a new card
   * @param {Object} cardData - Card information
   * @returns {Promise} API response
   */
  async createCard(cardData) {
    return apiMethods.post(ENDPOINTS.ADMIN.CARDS, cardData);
  }

  /**
   * Update a card
   * @param {string} cardId - Card ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise} API response
   */
  async updateCard(cardId, updates) {
    return apiMethods.patch(`${ENDPOINTS.ADMIN.CARDS}/${cardId}`, updates);
  }

  /**
   * Delete a card
   * @param {string} cardId - Card ID
   * @returns {Promise} API response
   */
  async deleteCard(cardId) {
    return apiMethods.delete(`${ENDPOINTS.ADMIN.CARDS}/${cardId}`);
  }

  /**
   * Get admin analytics
   * @param {Object} filters - Optional filters (date range, etc.)
   * @returns {Promise} API response
   */
  async getAnalytics(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiMethods.get(`${ENDPOINTS.ADMIN.ANALYTICS}?${queryParams}`);
  }

  /**
   * Get deck-specific analytics
   * @param {string} deckId - Deck ID
   * @param {Object} filters - Optional filters
   * @returns {Promise} API response
   */
  async getDeckAnalytics(deckId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiMethods.get(`${ENDPOINTS.ADMIN.DECK_ANALYTICS(deckId)}?${queryParams}`);
  }

  // Cards


  /**
   * Get all cards for admin with pagination and filtering
   * @param {Object} filters - Optional filters and pagination
   * @returns {Promise} API response
   */
  async getAllCards(filters = {}) {
    const queryParams = new URLSearchParams();

    // Pagination parameters
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

    // Filter parameters
    if (filters.relationshipType) queryParams.append('relationshipType', filters.relationshipType);
    if (filters.connectionLevel) queryParams.append('connectionLevel', filters.connectionLevel);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.tier) queryParams.append('tier', filters.tier);
    if (filters.deckId) queryParams.append('deckId', filters.deckId);
    if (filters.language) queryParams.append('language', filters.language);
    if (filters.searchQuery) queryParams.append('search', filters.searchQuery);

    return apiMethods.get(`${ENDPOINTS.ADMIN.CARDS}?${queryParams}`);

  }

}

export default new AdminService();
