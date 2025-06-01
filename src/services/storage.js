const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_PREFERENCES: 'userPreferences',
  GAME_STATE: 'gameState',
};

export const getStoredToken = () => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const storeToken = (token) => {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

export const removeStoredToken = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const getUserPreferences = () => {
  const prefs = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
  return prefs ? JSON.parse(prefs) : null;
};

export const storeUserPreferences = (preferences) => {
  localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
};

export const getGameState = () => {
  const state = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
  return state ? JSON.parse(state) : null;
};

export const storeGameState = (state) => {
  localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state));
};

export const clearGameState = () => {
  localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
};
