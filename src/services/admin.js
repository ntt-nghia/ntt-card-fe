// src/services/adminService.js
import { apiMethods, ENDPOINTS } from './api';

class AdminService {
  // Card Generation Methods

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
   * Approve or reject AI-generated cards
   * @param {Array} cardApprovals - Array of card approval decisions
   * @returns {Promise} API response
   */
  async approveGeneratedCards(cardApprovals) {
    return apiMethods.post('/v1/admin/approve-cards', {
      cardApprovals,
    });
  }

  /**
   * Get cards pending human review
   * @param {Object} filters - Optional filters
   * @returns {Promise} API response
   */
  async getPendingReviewCards(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiMethods.get(`/v1/admin/pending-review-cards?${queryParams}`);
  }

  /**
   * Regenerate specific cards with new parameters
   * @param {Array} cardIds - IDs of cards to regenerate
   * @param {Object} newParams - New generation parameters
   * @returns {Promise} API response
   */
  async regenerateCards(cardIds, newParams) {
    return apiMethods.post('/v1/admin/regenerate-cards', {
      cardIds,
      ...newParams,
    });
  }

  // Deck Management Methods

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
   * Add cards to a deck
   * @param {string} deckId - Deck ID
   * @param {Array} cardIds - Array of card IDs
   * @returns {Promise} API response
   */
  async addCardsToDeck(deckId, cardIds) {
    return apiMethods.post(`${ENDPOINTS.ADMIN.DECKS}/${deckId}/cards`, {
      cardIds,
    });
  }

  /**
   * Remove cards from a deck
   * @param {string} deckId - Deck ID
   * @param {Array} cardIds - Array of card IDs
   * @returns {Promise} API response
   */
  async removeCardsFromDeck(deckId, cardIds) {
    return apiMethods.delete(`${ENDPOINTS.ADMIN.DECKS}/${deckId}/cards`, {
      data: { cardIds },
    });
  }

  // Card Management Methods

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
   * Bulk create cards
   * @param {Array} cards - Array of card objects
   * @returns {Promise} API response
   */
  async bulkCreateCards(cards) {
    return apiMethods.post(ENDPOINTS.ADMIN.CARDS_BULK, {
      cards,
    });
  }

  // Analytics Methods

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

  // Utility Methods

  /**
   * Validate generation parameters
   * @param {Object} params - Parameters to validate
   * @returns {Object} Validation result
   */
  validateGenerationParams(params) {
    const errors = [];

    if (!params.relationshipType) {
      errors.push('Relationship type is required');
    }

    if (!params.connectionLevel || params.connectionLevel < 1 || params.connectionLevel > 4) {
      errors.push('Connection level must be between 1 and 4');
    }

    if (params.count && (params.count < 1 || params.count > 20)) {
      errors.push('Card count must be between 1 and 20');
    }

    if (params.theta && (params.theta < 0.1 || params.theta > 1.0)) {
      errors.push('Theta must be between 0.1 and 1.0');
    }

    if (!params.targetLanguages || !Array.isArray(params.targetLanguages) || params.targetLanguages.length === 0) {
      errors.push('At least one target language is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get quality description for theta value
   * @param {number} theta - Theta value
   * @returns {Object} Quality description
   */
  getQualityDescription(theta) {
    if (theta <= 0.3) return { text: 'Basic', color: 'gray' };
    if (theta <= 0.5) return { text: 'Standard', color: 'blue' };
    if (theta <= 0.7) return { text: 'Premium', color: 'purple' };
    return { text: 'Elite', color: 'gold' };
  }

  /**
   * Format generation configuration for display
   * @param {Object} config - Generation configuration
   * @returns {string} Formatted string
   */
  formatGenerationConfig(config) {
    const relationshipDisplay = config.relationshipType.replace('_', ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
    const quality = this.getQualityDescription(config.theta);

    return `${relationshipDisplay} - Level ${config.connectionLevel} (${config.count} cards, ${quality.text})`;
  }
}

// Export singleton instance
export default new AdminService();
