import { CARD_TYPES, DECK_TIERS, RELATIONSHIP_TYPES } from './constants';

/**
 * Email validation regex pattern
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password validation regex pattern (at least 8 chars, with letters and numbers)
 */
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
export const validateEmail = (email) => {
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  } else if (typeof email !== 'string') {
    errors.push('Email must be a string');
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.push('Please enter a valid email address');
  } else if (email.length > 254) {
    errors.push('Email address is too long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length (default: 8)
 * @param {boolean} options.requireNumbers - Require numbers (default: true)
 * @param {boolean} options.requireLetters - Require letters (default: true)
 * @param {boolean} options.requireSpecial - Require special characters (default: false)
 * @returns {Object} Validation result with strength score
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireNumbers = true,
    requireLetters = true,
    requireSpecial = false,
  } = options;

  const errors = [];
  let strength = 0;

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors, strength: 0 };
  }

  if (typeof password !== 'string') {
    errors.push('Password must be a string');
    return { isValid: false, errors, strength: 0 };
  }

  // Length validation
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  } else {
    strength += 1;
  }

  // Character type validation
  const hasNumbers = /\d/.test(password);
  const hasLetters = /[A-Za-z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);

  if (requireNumbers && !hasNumbers) {
    errors.push('Password must contain at least one number');
  } else if (hasNumbers) {
    strength += 1;
  }

  if (requireLetters && !hasLetters) {
    errors.push('Password must contain at least one letter');
  } else if (hasLetters) {
    strength += 1;
  }

  if (requireSpecial && !hasSpecial) {
    errors.push('Password must contain at least one special character');
  } else if (hasSpecial) {
    strength += 1;
  }

  // Bonus points for complexity
  if (hasUppercase && hasLowercase) {
    strength += 1;
  }

  if (password.length >= 12) {
    strength += 1;
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: Math.min(strength, 5), // Cap at 5
    strengthLabel: getPasswordStrengthLabel(strength),
  };
};

/**
 * Get password strength label
 * @param {number} strength - Strength score (0-5)
 * @returns {string} Strength label
 */
const getPasswordStrengthLabel = (strength) => {
  if (strength <= 1) return 'Very Weak';
  if (strength === 2) return 'Weak';
  if (strength === 3) return 'Fair';
  if (strength === 4) return 'Good';
  return 'Strong';
};

/**
 * Validate display name
 * @param {string} displayName - Display name to validate
 * @returns {Object} Validation result
 */
export const validateDisplayName = (displayName) => {
  const errors = [];

  if (!displayName) {
    errors.push('Display name is required');
  } else if (typeof displayName !== 'string') {
    errors.push('Display name must be a string');
  } else {
    const trimmed = displayName.trim();
    if (trimmed.length < 1) {
      errors.push('Display name cannot be empty');
    } else if (trimmed.length > 50) {
      errors.push('Display name must be less than 50 characters');
    } else if (!/^[a-zA-Z0-9\s\-_.]+$/.test(trimmed)) {
      errors.push(
        'Display name can only contain letters, numbers, spaces, hyphens, underscores, and periods',
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate birth date and age requirement
 * @param {Date|string} birthDate - Birth date to validate
 * @param {number} minimumAge - Minimum required age (default: 18)
 * @returns {Object} Validation result
 */
export const validateBirthDate = (birthDate, minimumAge = 18) => {
  const errors = [];

  if (!birthDate) {
    errors.push('Birth date is required');
    return { isValid: false, errors };
  }

  const date = new Date(birthDate);

  if (isNaN(date.getTime())) {
    errors.push('Please enter a valid birth date');
    return { isValid: false, errors };
  }

  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  const dayDiff = today.getDate() - date.getDate();

  // Adjust age if birthday hasn't occurred this year
  const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

  if (date > today) {
    errors.push('Birth date cannot be in the future');
  } else if (actualAge < minimumAge) {
    errors.push(`You must be at least ${minimumAge} years old`);
  } else if (actualAge > 120) {
    errors.push('Please enter a valid birth date');
  }

  return {
    isValid: errors.length === 0,
    errors,
    age: actualAge,
  };
};

/**
 * Validate relationship type
 * @param {string} relationshipType - Relationship type to validate
 * @returns {Object} Validation result
 */
export const validateRelationshipType = (relationshipType) => {
  const errors = [];

  if (!relationshipType) {
    errors.push('Relationship type is required');
  } else if (!Object.values(RELATIONSHIP_TYPES).includes(relationshipType)) {
    errors.push('Invalid relationship type');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate card type
 * @param {string} cardType - Card type to validate
 * @returns {Object} Validation result
 */
export const validateCardType = (cardType) => {
  const errors = [];

  if (!cardType) {
    errors.push('Card type is required');
  } else if (!Object.values(CARD_TYPES).includes(cardType)) {
    errors.push('Invalid card type');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate deck tier
 * @param {string} deckTier - Deck tier to validate
 * @returns {Object} Validation result
 */
export const validateDeckTier = (deckTier) => {
  const errors = [];

  if (!deckTier) {
    errors.push('Deck tier is required');
  } else if (!Object.values(DECK_TIERS).includes(deckTier)) {
    errors.push('Invalid deck tier');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate connection level
 * @param {number} level - Connection level to validate
 * @returns {Object} Validation result
 */
export const validateConnectionLevel = (level) => {
  const errors = [];

  if (level === null || level === undefined) {
    errors.push('Connection level is required');
  } else if (typeof level !== 'number' || !Number.isInteger(level)) {
    errors.push('Connection level must be a whole number');
  } else if (level < 1 || level > 4) {
    errors.push('Connection level must be between 1 and 4');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate session configuration
 * @param {Object} config - Session configuration to validate
 * @returns {Object} Validation result
 */
export const validateSessionConfiguration = (config) => {
  const errors = [];

  if (!config || typeof config !== 'object') {
    errors.push('Session configuration is required');
    return { isValid: false, errors };
  }

  // Validate relationship type
  const relationshipValidation = validateRelationshipType(config.relationshipType);
  if (!relationshipValidation.isValid) {
    errors.push(...relationshipValidation.errors);
  }

  // Validate selected decks
  if (!config.selectedDeckIds || !Array.isArray(config.selectedDeckIds)) {
    errors.push('Selected deck IDs must be an array');
  } else if (config.selectedDeckIds.length === 0) {
    errors.push('At least one deck must be selected');
  } else if (config.selectedDeckIds.length > 5) {
    errors.push('Maximum of 5 decks can be selected');
  }

  // Validate language
  if (config.language && !['en', 'vn'].includes(config.language)) {
    errors.push('Language must be "en" or "vn"');
  }

  // Validate max duration
  if (config.maxDuration !== undefined) {
    if (typeof config.maxDuration !== 'number') {
      errors.push('Max duration must be a number');
    } else if (config.maxDuration < 300000 || config.maxDuration > 7200000) {
      errors.push('Max duration must be between 5 minutes and 2 hours');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate card content
 * @param {string|Object} content - Card content to validate
 * @returns {Object} Validation result
 */
export const validateCardContent = (content) => {
  const errors = [];

  if (!content) {
    errors.push('Card content is required');
    return { isValid: false, errors };
  }

  if (typeof content === 'string') {
    // Simple string content
    if (content.trim().length < 10) {
      errors.push('Card content must be at least 10 characters long');
    } else if (content.trim().length > 500) {
      errors.push('Card content must be less than 500 characters');
    }
  } else if (typeof content === 'object') {
    // Multilingual content
    if (!content.en) {
      errors.push('English content is required');
    } else {
      if (content.en.trim().length < 10) {
        errors.push('English content must be at least 10 characters long');
      } else if (content.en.trim().length > 500) {
        errors.push('English content must be less than 500 characters');
      }
    }

    if (content.vn && (content.vn.trim().length < 10 || content.vn.trim().length > 500)) {
      errors.push('Vietnamese content must be between 10 and 500 characters');
    }
  } else {
    errors.push('Card content must be a string or object with language keys');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array)
 * @param {*} value - Value to check
 * @returns {boolean} Whether the value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
};

