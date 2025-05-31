export const authSelectors = {
  getAuthState: (state) => state.auth,

  getUser: (state) => state.auth.user,

  getToken: (state) => state.auth.token,

  getIsAuthenticated: (state) => state.auth.isAuthenticated,

  getIsLoading: (state) => state.auth.isLoading,

  getError: (state) => state.auth.error,

  getIsInitialized: (state) => state.auth.isInitialized,

  getIsAdmin: (state) => state.auth.user?.role === 'admin',

  getUserId: (state) => state.auth.user?.uid,

  getUserDisplayName: (state) => state.auth.user?.displayName,

  getUserEmail: (state) => state.auth.user?.email,

  getUserAvatar: (state) => state.auth.user?.avatar,

  getUserLanguage: (state) => state.auth.user?.language || 'en',

  getUserStatistics: (state) => state.auth.user?.statistics,
};
