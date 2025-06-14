export const RELATIONSHIP_TYPES = {
  FRIENDS: 'friends',
  COLLEAGUES: 'colleagues',
  NEW_COUPLES: 'new_couples',
  ESTABLISHED_COUPLES: 'established_couples',
  FAMILY: 'family',
};

export const CARD_RELATIONSHIP_TYPES = [
  { value: 'friends', label: 'Friends' },
  { value: 'colleagues', label: 'Colleagues' },
  { value: 'new_couples', label: 'New Couples' },
  { value: 'established_couples', label: 'Established Couples' },
  { value: 'family', label: 'Family' },
];

export const CARD_CONNECTION_LEVELS = [
  { value: 1, label: 'Surface' },
  { value: 2, label: 'Personal' },
  { value: 3, label: 'Vulnerable' },
  { value: 4, label: 'Deep' },
];

export const CARD_TYPES = [
  { value: 'question', label: 'Question' },
  { value: 'challenge', label: 'Challenge' },
  { value: 'scenario', label: 'Scenario' },
  { value: 'connection', label: 'Connection' },
  { value: 'wild', label: 'Wild' },
];

export const CARD_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'review', label: 'Pending Review' },
  { value: 'archived', label: 'Archived' },
  { value: 'draft', label: 'Draft' },
];

export const CARD_TIERS = [
  { value: 'FREE', label: 'Free' },
  { value: 'PREMIUM', label: 'Premium' },
];

export const SESSION_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
};

export const DECK_TIERS = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
};

export const LANGUAGES = {
  EN: 'en',
  VN: 'vn',
};
