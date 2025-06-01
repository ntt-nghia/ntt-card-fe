import { CONNECTION_LEVELS, CARD_TYPES, SESSION_STATUS } from './constants';

/**
 * Calculate session progress based on drawn and available cards
 * @param {Object} session - Session object
 * @param {number} session.drawnCards - Array of drawn card IDs
 * @param {number} session.availableCardPool - Array of available card IDs
 * @returns {Object} Progress object with percentage and counts
 */
export const calculateSessionProgress = (session) => {
  if (!session || !session.availableCardPool) {
    return { progress: 0, completed: 0, total: 0, remaining: 0 };
  }

  const drawnCount = session.drawnCards?.length || 0;
  const completedCount = session.completedCards?.length || 0;
  const totalCards = session.availableCardPool.length;
  const remaining = Math.max(0, totalCards - drawnCount);

  const progress = totalCards > 0 ? (drawnCount / totalCards) * 100 : 0;

  return {
    progress: Math.round(progress * 100) / 100, // Round to 2 decimal places
    completed: completedCount,
    total: totalCards,
    remaining,
    drawn: drawnCount,
  };
};

/**
 * Calculate comprehensive session statistics
 * @param {Object} session - Session object
 * @returns {Object} Session statistics
 */
export const calculateSessionStats = (session) => {
  if (!session) {
    return {
      totalCards: 0,
      completedCards: 0,
      skippedCards: 0,
      completionRate: 0,
      skipRate: 0,
      averageLevel: 0,
      duration: 0,
    };
  }

  const totalCards = session.drawnCards?.length || 0;
  const completedCards = session.completedCards?.length || 0;
  const skippedCards = session.skippedCards?.length || 0;

  const completionRate = totalCards > 0 ? completedCards / totalCards : 0;
  const skipRate = totalCards > 0 ? skippedCards / totalCards : 0;

  // Calculate duration
  const startTime = session.startedAt ? new Date(session.startedAt) : new Date();
  const endTime = session.endedAt ? new Date(session.endedAt) : new Date();
  const duration = endTime - startTime;

  return {
    totalCards,
    completedCards,
    skippedCards,
    completionRate: Math.round(completionRate * 100) / 100,
    skipRate: Math.round(skipRate * 100) / 100,
    averageLevel: session.currentLevel || 1,
    duration: Math.max(0, duration),
  };
};

/**
 * Determine if a user should progress to the next connection level
 * @param {Object} session - Current session
 * @param {number} cardsPerLevel - Cards required per level (default: 5)
 * @returns {Object} Level progression info
 */
export const checkLevelProgression = (session, cardsPerLevel = 5) => {
  if (!session) {
    return { shouldProgress: false, currentLevel: 1, nextLevel: 1 };
  }

  const completedCount = session.completedCards?.length || 0;
  const currentLevel = session.currentLevel || 1;
  const targetLevel = Math.min(
    Math.floor(completedCount / cardsPerLevel) + 1,
    CONNECTION_LEVELS.DEEP
  );

  return {
    shouldProgress: targetLevel > currentLevel,
    currentLevel,
    nextLevel: targetLevel,
    progressToNext: completedCount % cardsPerLevel,
    cardsNeededForNext: cardsPerLevel - (completedCount % cardsPerLevel),
  };
};

/**
 * Filter cards by connection level and relationship type
 * @param {Array} cards - Array of card objects
 * @param {Object} filters - Filter criteria
 * @param {number} filters.maxLevel - Maximum connection level
 * @param {string} filters.relationshipType - Target relationship type
 * @param {Array} filters.excludeIds - Card IDs to exclude
 * @returns {Array} Filtered cards
 */
export const filterCards = (cards, filters = {}) => {
  if (!Array.isArray(cards)) {
    return [];
  }

  return cards.filter((card) => {
    // Connection level filter
    if (filters.maxLevel && card.connectionLevel > filters.maxLevel) {
      return false;
    }

    // Relationship type filter
    if (filters.relationshipType && card.relationshipTypes) {
      if (!card.relationshipTypes.includes(filters.relationshipType)) {
        return false;
      }
    }

    // Exclude specific cards
    if (filters.excludeIds && filters.excludeIds.includes(card.id)) {
      return false;
    }

    // Card type filter
    if (filters.cardType && card.type !== filters.cardType) {
      return false;
    }

    // Status filter (active cards only by default)
    if (filters.status !== undefined && card.status !== filters.status) {
      return false;
    }

    return true;
  });
};

/**
 * Select a random card from available cards with optional weighting
 * @param {Array} availableCards - Array of available cards
 * @param {Object} options - Selection options
 * @param {boolean} options.weighted - Use card theta for weighting
 * @param {number} options.preferredLevel - Prefer cards of this level
 * @returns {Object|null} Selected card or null if none available
 */
export const selectRandomCard = (availableCards, options = {}) => {
  if (!Array.isArray(availableCards) || availableCards.length === 0) {
    return null;
  }

  const { weighted = false, preferredLevel } = options;

  let candidateCards = [...availableCards];

  // Prefer cards of specific level if specified
  if (preferredLevel) {
    const preferredCards = candidateCards.filter((card) => card.connectionLevel === preferredLevel);
    if (preferredCards.length > 0) {
      candidateCards = preferredCards;
    }
  }

  // Simple random selection if not weighted
  if (!weighted) {
    const randomIndex = Math.floor(Math.random() * candidateCards.length);
    return candidateCards[randomIndex];
  }

  // Weighted selection based on theta values
  const totalWeight = candidateCards.reduce((sum, card) => sum + (card.theta || 0.5), 0);

  if (totalWeight === 0) {
    // Fallback to simple random if no weights
    const randomIndex = Math.floor(Math.random() * candidateCards.length);
    return candidateCards[randomIndex];
  }

  const randomValue = Math.random() * totalWeight;
  let currentWeight = 0;

  for (const card of candidateCards) {
    currentWeight += card.theta || 0.5;
    if (randomValue <= currentWeight) {
      return card;
    }
  }

  // Fallback to last card
  return candidateCards[candidateCards.length - 1];
};

/**
 * Check if a session can continue (has available cards)
 * @param {Object} session - Session object
 * @returns {boolean} Whether session can continue
 */
export const canDrawCard = (session) => {
  if (!session || session.status !== SESSION_STATUS.ACTIVE) {
    return false;
  }

  const drawnCards = session.drawnCards || [];
  const availableCards = session.availableCardPool || [];

  return availableCards.length > drawnCards.length;
};

/**
 * Validate session configuration
 * @param {Object} config - Session configuration
 * @returns {Object} Validation result
 */
export const validateSessionConfig = (config) => {
  const errors = [];
  const warnings = [];

  if (!config) {
    errors.push('Session configuration is required');
    return { isValid: false, errors, warnings };
  }

  // Check relationship type
  if (!config.relationshipType) {
    errors.push('Relationship type is required');
  }

  // Check selected decks
  if (!config.selectedDeckIds || config.selectedDeckIds.length === 0) {
    errors.push('At least one deck must be selected');
  }

  // Check language
  if (config.language && !['en', 'vn'].includes(config.language)) {
    warnings.push('Unsupported language, falling back to English');
  }

  // Check max duration
  if (config.maxDuration && (config.maxDuration < 300000 || config.maxDuration > 7200000)) {
    warnings.push('Session duration should be between 5 minutes and 2 hours');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Calculate card effectiveness metrics
 * @param {Object} card - Card object with statistics
 * @returns {Object} Effectiveness metrics
 */
export const calculateCardEffectiveness = (card) => {
  if (!card || !card.statistics) {
    return {
      effectiveness: 0,
      popularity: 0,
      quality: 0,
    };
  }

  const stats = card.statistics;
  const timesDrawn = stats.timesDrawn || 0;
  const skipRate = stats.skipRate || 0;
  const avgRating = stats.averageRating || 0;

  // Calculate effectiveness (lower skip rate is better)
  const effectiveness = timesDrawn > 0 ? (1 - skipRate) * 100 : 0;

  // Calculate popularity (how often it's drawn)
  const popularity = Math.min(timesDrawn / 100, 1) * 100; // Normalize to 0-100

  // Calculate quality (based on rating and theta)
  const theta = card.theta || 0.5;
  const quality = avgRating > 0 ? (avgRating / 5) * 100 : theta * 100;

  return {
    effectiveness: Math.round(effectiveness),
    popularity: Math.round(popularity),
    quality: Math.round(quality),
  };
};

/**
 * Generate session recommendations based on user history
 * @param {Object} userStats - User statistics
 * @param {Array} availableDecks - Available decks
 * @returns {Array} Recommended deck IDs
 */
export const generateSessionRecommendations = (userStats, availableDecks) => {
  if (!userStats || !Array.isArray(availableDecks)) {
    return [];
  }

  const favoriteType = userStats.favoriteRelationshipType;
  const typeUsage = userStats.relationshipTypeUsage || {};

  // Recommend based on favorite type
  let recommendations = availableDecks.filter(
    (deck) => deck.relationshipType === favoriteType && (deck.tier === 'FREE' || deck.isUnlocked)
  );

  // If no favorites, recommend popular decks
  if (recommendations.length === 0) {
    recommendations = availableDecks
      .filter((deck) => deck.tier === 'FREE' || deck.isUnlocked)
      .sort((a, b) => (b.statistics?.sessionsPlayed || 0) - (a.statistics?.sessionsPlayed || 0))
      .slice(0, 3);
  }

  // Ensure we don't recommend too many
  return recommendations.slice(0, 3).map((deck) => deck.id);
};

/**
 * Build card pool from selected decks with access control
 * @param {Array} selectedDeckIds - Selected deck IDs
 * @param {Array} allDecks - All available decks
 * @param {Array} userUnlockedDecks - User's unlocked deck IDs
 * @param {Object} filters - Additional filters
 * @returns {Array} Card IDs available for session
 */
export const buildCardPool = (selectedDeckIds, allDecks, userUnlockedDecks = [], filters = {}) => {
  if (!Array.isArray(selectedDeckIds) || !Array.isArray(allDecks)) {
    return [];
  }

  const cardIds = new Set();

  selectedDeckIds.forEach((deckId) => {
    const deck = allDecks.find((d) => d.id === deckId);
    if (!deck) return;

    // Check access
    const hasAccess = deck.tier === 'FREE' || userUnlockedDecks.includes(deckId);
    if (!hasAccess) return;

    // Add cards from this deck (this would need actual card data)
    // For now, we'll return a placeholder
    if (deck.cardCount && deck.cardCount.total > 0) {
      // In real implementation, this would fetch actual card IDs
      for (let i = 0; i < deck.cardCount.total; i++) {
        cardIds.add(`${deckId}_card_${i}`);
      }
    }
  });

  return Array.from(cardIds);
};
