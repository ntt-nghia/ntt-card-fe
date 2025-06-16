// src/utils/cardUtils.js - Utility functions for card handling
import { CARD_STATUSES, CARD_TIERS, CARD_CONNECTION_LEVELS } from './constants';

/**
 * Format card content for display
 * Handles both string and multilingual object content
 * @param {string|Object} content - Card content
 * @param {string} language - Preferred language (default: 'en')
 * @returns {string} Formatted content
 */
export const formatCardContent = (content, language = 'en') => {
  if (typeof content === 'string') {
    return content;
  }

  if (content && typeof content === 'object') {
    // Try preferred language first
    if (content[language]) {
      return content[language];
    }

    // Fallback to English
    if (content.en) {
      return content.en;
    }

    // Fallback to first available language
    const firstKey = Object.keys(content)[0];
    if (firstKey) {
      return content[firstKey];
    }
  }

  return 'No content available';
};

/**
 * Prepare card content for saving
 * Always returns an object with language keys, preserving existing languages
 * @param {string|Object} originalContent - Original card content
 * @param {string} newContent - New content to save
 * @param {string} language - Target language (default: 'en')
 * @returns {Object} Prepared content object with language keys
 */
export const prepareCardContent = (originalContent, newContent, language = 'en') => {
  // Start with existing content structure or empty object
  const existingContent = typeof originalContent === 'object' && originalContent !== null
    ? originalContent
    : {};

  // Always return an object with language keys
  return {
    ...existingContent, // Preserve all existing languages (vi, fr, etc.)
    [language]: newContent.trim(), // Update the target language
  };
};

/**
 * Validate card data for editing
 * @param {Object} cardData - Card data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateCardData = (cardData) => {
  const errors = [];

  // Content validation
  if (!cardData.content || !cardData.content.trim()) {
    errors.push('Card content is required');
  } else if (cardData.content.trim().length < 10) {
    errors.push('Content must be at least 10 characters');
  } else if (cardData.content.trim().length > 1000) {
    errors.push('Content must not exceed 1000 characters');
  }

  // Status validation
  const validStatuses = CARD_STATUSES.map(s => s.value);
  if (!cardData.status || !validStatuses.includes(cardData.status)) {
    errors.push('Invalid card status');
  }

  // Tier validation
  const validTiers = CARD_TIERS.map(t => t.value);
  if (!cardData.tier || !validTiers.includes(cardData.tier)) {
    errors.push('Invalid card tier');
  }

  // Connection level validation
  const validLevels = CARD_CONNECTION_LEVELS.map(l => l.value);
  if (!cardData.connectionLevel || !validLevels.includes(cardData.connectionLevel)) {
    errors.push('Invalid connection level');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Check if card data has meaningful changes
 * @param {Object} originalCard - Original card data
 * @param {Object} editedData - Edited card data
 * @param {string} language - Language being edited (default: 'en')
 * @returns {boolean} True if there are meaningful changes
 */
export const hasCardChanges = (originalCard, editedData, language = 'en') => {
  if (!originalCard || !editedData) return false;

  // Get original content for comparison
  const originalContent = formatCardContent(originalCard.content, language);
  const newContent = editedData.content?.trim() || '';

  // Check each field for changes
  const contentChanged = originalContent !== newContent;
  const statusChanged = (originalCard.status || 'active') !== editedData.status;
  const tierChanged = (originalCard.tier || 'FREE') !== editedData.tier;
  const levelChanged = (originalCard.connectionLevel || 1) !== editedData.connectionLevel;

  return contentChanged || statusChanged || tierChanged || levelChanged;
};

/**
 * Get card status display information
 * @param {string} status - Card status
 * @returns {Object} Status display info with color, label, and description
 */
export const getCardStatusInfo = (status) => {
  const statusMap = {
    active: {
      color: 'green',
      label: 'Active',
      description: 'Card is live and available for sessions',
      bgClass: 'bg-green-100',
      textClass: 'text-green-800',
      borderClass: 'border-green-200',
    },
    review: {
      color: 'yellow',
      label: 'Review',
      description: 'Card is pending review and approval',
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-800',
      borderClass: 'border-yellow-200',
    },
    archived: {
      color: 'gray',
      label: 'Archived',
      description: 'Card is archived and not available',
      bgClass: 'bg-gray-100',
      textClass: 'text-gray-800',
      borderClass: 'border-gray-200',
    },
    draft: {
      color: 'blue',
      label: 'Draft',
      description: 'Card is in draft mode',
      bgClass: 'bg-blue-100',
      textClass: 'text-blue-800',
      borderClass: 'border-blue-200',
    },
  };

  return statusMap[status] || statusMap.active;
};

/**
 * Get card tier display information
 * @param {string} tier - Card tier
 * @returns {Object} Tier display info with color, label, and description
 */
export const getCardTierInfo = (tier) => {
  const tierMap = {
    FREE: {
      color: 'green',
      label: 'Free',
      description: 'Available to all users',
      bgClass: 'bg-green-100',
      textClass: 'text-green-800',
      borderClass: 'border-green-200',
    },
    PREMIUM: {
      color: 'purple',
      label: 'Premium',
      description: 'Requires premium access',
      bgClass: 'bg-purple-100',
      textClass: 'text-purple-800',
      borderClass: 'border-purple-200',
    },
  };

  return tierMap[tier] || tierMap.FREE;
};

/**
 * Get connection level display information
 * @param {number} level - Connection level
 * @returns {Object} Level display info with color, label, and description
 */
export const getConnectionLevelInfo = (level) => {
  const levelMap = {
    1: {
      color: 'blue',
      label: 'Surface',
      description: 'Light, fun, low-vulnerability topics',
      bgClass: 'bg-blue-100',
      textClass: 'text-blue-800',
    },
    2: {
      color: 'yellow',
      label: 'Personal',
      description: 'Sharing preferences and experiences',
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-800',
    },
    3: {
      color: 'orange',
      label: 'Vulnerable',
      description: 'Deeper fears, dreams, and challenges',
      bgClass: 'bg-orange-100',
      textClass: 'text-orange-800',
    },
    4: {
      color: 'red',
      label: 'Deep',
      description: 'Core values and transformative experiences',
      bgClass: 'bg-red-100',
      textClass: 'text-red-800',
    },
  };

  return levelMap[level] || levelMap[1];
};

/**
 * Create optimistic update data for UI
 * Updates the local state immediately while API call is in progress
 * @param {Object} originalCard - Original card data
 * @param {Object} updateData - Data being updated
 * @returns {Object} Optimistically updated card
 */
export const createOptimisticUpdate = (originalCard, updateData) => {
  return {
    ...originalCard,
    ...updateData,
    updatedAt: new Date(),
    // Keep track of optimistic update
    _optimistic: true,
  };
};

/**
 * Calculate content similarity for duplicate detection
 * Simple similarity check to warn about potential duplicates
 * @param {string} content1 - First content string
 * @param {string} content2 - Second content string
 * @returns {number} Similarity score between 0 and 1
 */
export const calculateContentSimilarity = (content1, content2) => {
  if (!content1 || !content2) return 0;

  const str1 = content1.toLowerCase().trim();
  const str2 = content2.toLowerCase().trim();

  if (str1 === str2) return 1;

  // Simple word overlap similarity
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);

  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];

  return intersection.length / union.length;
};

/**
 * Generate card preview for editing
 * @param {Object} cardData - Card data for preview
 * @returns {Object} Preview data with truncated content and metadata
 */
export const generateCardPreview = (cardData) => {
  const content = formatCardContent(cardData.content);
  const maxLength = 200;

  return {
    content: content.length > maxLength
      ? `${content.substring(0, maxLength)}...`
      : content,
    wordCount: content.split(/\s+/).length,
    characterCount: content.length,
    estimatedReadTime: Math.ceil(content.split(/\s+/).length / 200), // Average reading speed
    statusInfo: getCardStatusInfo(cardData.status),
    tierInfo: getCardTierInfo(cardData.tier),
    levelInfo: getConnectionLevelInfo(cardData.connectionLevel),
  };
};
