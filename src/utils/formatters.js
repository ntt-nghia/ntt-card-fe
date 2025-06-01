import { RELATIONSHIP_TYPES } from './constants';

/**
 * Format duration from milliseconds to human-readable string
 * @param {number} milliseconds - Duration in milliseconds
 * @param {Object} options - Formatting options
 * @param {boolean} options.short - Use short format (e.g., "5m" vs "5 minutes")
 * @param {boolean} options.includeSeconds - Include seconds in output
 * @returns {string} Formatted duration string
 */
export const formatDuration = (milliseconds, options = {}) => {
  if (!milliseconds || milliseconds < 0) {
    return options.short ? '0s' : '0 seconds';
  }

  const { short = false, includeSeconds = true } = options;

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  const parts = [];

  if (days > 0) {
    parts.push(short ? `${days}d` : `${days} day${days !== 1 ? 's' : ''}`);
  }

  if (remainingHours > 0) {
    parts.push(
      short ? `${remainingHours}h` : `${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`
    );
  }

  if (remainingMinutes > 0) {
    parts.push(
      short
        ? `${remainingMinutes}m`
        : `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`
    );
  }

  if (includeSeconds && remainingSeconds > 0 && days === 0 && hours === 0) {
    parts.push(
      short
        ? `${remainingSeconds}s`
        : `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`
    );
  }

  if (parts.length === 0) {
    return short ? '0s' : '0 seconds';
  }

  return short ? parts.join(' ') : parts.join(', ');
};

/**
 * Format date to human-readable string
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.relative - Use relative format (e.g., "2 days ago")
 * @param {string} options.format - Date format: 'short', 'medium', 'long', 'full'
 * @param {boolean} options.includeTime - Include time in the output
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) {
    return '';
  }

  const { relative = false, format = 'medium', includeTime = false } = options;
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  if (relative) {
    return formatRelativeTime(dateObj);
  }

  const formatOptions = {
    short: { dateStyle: 'short' },
    medium: { dateStyle: 'medium' },
    long: { dateStyle: 'long' },
    full: { dateStyle: 'full' },
  };

  const baseOptions = formatOptions[format] || formatOptions.medium;

  if (includeTime) {
    baseOptions.timeStyle = 'short';
  }

  return new Intl.DateTimeFormat('en-US', baseOptions).format(dateObj);
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @param {Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) {
    return '';
  }

  const now = new Date();
  const diffMs = date - now;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, 'day');
  }

  if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, 'hour');
  }

  if (Math.abs(diffMinutes) >= 1) {
    return rtf.format(diffMinutes, 'minute');
  }

  return rtf.format(diffSeconds, 'second');
};

/**
 * Format numbers with appropriate units and formatting
 * @param {number} number - Number to format
 * @param {Object} options - Formatting options
 * @param {string} options.style - 'decimal', 'currency', 'percent', 'unit'
 * @param {string} options.currency - Currency code (for currency style)
 * @param {number} options.minimumFractionDigits - Minimum decimal places
 * @param {number} options.maximumFractionDigits - Maximum decimal places
 * @param {boolean} options.compact - Use compact notation (e.g., "1.2K")
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, options = {}) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }

  const {
    style = 'decimal',
    currency = 'USD',
    minimumFractionDigits,
    maximumFractionDigits,
    compact = false,
  } = options;

  const formatOptions = {
    style,
    ...(style === 'currency' && { currency }),
    ...(minimumFractionDigits !== undefined && { minimumFractionDigits }),
    ...(maximumFractionDigits !== undefined && { maximumFractionDigits }),
    ...(compact && { notation: 'compact' }),
  };

  return new Intl.NumberFormat('en-US', formatOptions).format(number);
};

/**
 * Format percentage with proper styling
 * @param {number} value - Value to format as percentage (0-1 or 0-100)
 * @param {Object} options - Formatting options
 * @param {boolean} options.isDecimal - Whether input is decimal (0-1) or percentage (0-100)
 * @param {number} options.decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, options = {}) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const { isDecimal = true, decimals = 1 } = options;
  const percentage = isDecimal ? value * 100 : value;

  return formatNumber(percentage, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format currency amounts
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {Object} options - Additional formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', options = {}) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return formatNumber(0, { style: 'currency', currency });
  }

  return formatNumber(amount, {
    style: 'currency',
    currency,
    ...options,
  });
};

/**
 * Get display name for relationship types
 * @param {string} relationshipType - Relationship type constant
 * @param {Object} options - Display options
 * @param {boolean} options.capitalize - Capitalize the output
 * @param {boolean} options.plural - Use plural form
 * @returns {string} Human-readable relationship type name
 */
export const formatRelationshipType = (relationshipType, options = {}) => {
  const { capitalize = true, plural = false } = options;

  const typeMap = {
    [RELATIONSHIP_TYPES.FRIENDS]: plural ? 'friends' : 'friend',
    [RELATIONSHIP_TYPES.COLLEAGUES]: plural ? 'colleagues' : 'colleague',
    [RELATIONSHIP_TYPES.NEW_COUPLES]: plural ? 'new couples' : 'new couple',
    [RELATIONSHIP_TYPES.ESTABLISHED_COUPLES]: plural ? 'established couples' : 'established couple',
    [RELATIONSHIP_TYPES.FAMILY]: 'family',
  };

  let displayName = typeMap[relationshipType] || relationshipType;

  // Handle underscore replacement for any unmapped types
  if (!typeMap[relationshipType]) {
    displayName = relationshipType.replace(/_/g, ' ');
  }

  if (capitalize) {
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  }

  return displayName;
};

/**
 * Format card statistics for display
 * @param {Object} statistics - Card statistics object
 * @returns {Object} Formatted statistics
 */
export const formatCardStatistics = (statistics) => {
  if (!statistics) {
    return {
      timesPlayed: '0',
      skipRate: '0%',
      rating: 'Not rated',
      effectiveness: '0%',
    };
  }

  const { timesDrawn = 0, skipRate = 0, averageRating = 0 } = statistics;

  const effectiveness = timesDrawn > 0 ? (1 - skipRate) * 100 : 0;

  return {
    timesPlayed: formatNumber(timesDrawn, { compact: true }),
    skipRate: formatPercentage(skipRate, { isDecimal: true, decimals: 1 }),
    rating: averageRating > 0 ? `${averageRating.toFixed(1)}/5` : 'Not rated',
    effectiveness: formatPercentage(effectiveness, { isDecimal: false, decimals: 1 }),
  };
};

/**
 * Format session statistics for display
 * @param {Object} statistics - Session statistics object
 * @returns {Object} Formatted session statistics
 */
export const formatSessionStatistics = (statistics) => {
  if (!statistics) {
    return {
      duration: '0 minutes',
      completionRate: '0%',
      cardsCompleted: '0',
      averageLevel: '1',
    };
  }

  const { duration = 0, completionRate = 0, completedCards = 0, averageLevel = 1 } = statistics;

  return {
    duration: formatDuration(duration, { short: false, includeSeconds: false }),
    completionRate: formatPercentage(completionRate, { isDecimal: true, decimals: 1 }),
    cardsCompleted: formatNumber(completedCards),
    averageLevel: averageLevel.toFixed(1),
  };
};

/**
 * Format user statistics for display
 * @param {Object} userStats - User statistics object
 * @returns {Object} Formatted user statistics
 */
export const formatUserStatistics = (userStats) => {
  if (!userStats) {
    return {
      totalSessions: '0',
      averageDuration: '0 minutes',
      favoriteType: 'None',
      totalPlayTime: '0 hours',
    };
  }

  const {
    totalSessions = 0,
    averageSessionDuration = 0,
    favoriteRelationshipType,
    relationshipTypeUsage = {},
  } = userStats;

  // Calculate total play time
  const totalPlayTime = totalSessions * averageSessionDuration;

  return {
    totalSessions: formatNumber(totalSessions),
    averageDuration: formatDuration(averageSessionDuration, {
      short: false,
      includeSeconds: false,
    }),
    favoriteType: favoriteRelationshipType
      ? formatRelationshipType(favoriteRelationshipType, { capitalize: true })
      : 'None',
    totalPlayTime: formatDuration(totalPlayTime, { short: false, includeSeconds: false }),
  };
};

/**
 * Format file sizes
 * @param {number} bytes - Size in bytes
 * @param {boolean} binary - Use binary (1024) or decimal (1000) units
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, binary = true) => {
  if (!bytes || bytes === 0) {
    return '0 B';
  }

  const units = binary ? ['B', 'KiB', 'MiB', 'GiB', 'TiB'] : ['B', 'KB', 'MB', 'GB', 'TB'];

  const base = binary ? 1024 : 1000;
  const index = Math.floor(Math.log(bytes) / Math.log(base));
  const size = bytes / Math.pow(base, index);

  return `${size.toFixed(1)} ${units[index]}`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) {
    return text || '';
  }

  return text.substring(0, maxLength - suffix.length) + suffix;
};
