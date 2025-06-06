import {createSelector} from "@reduxjs/toolkit";

export const authSelectors = {
  getAuthState: (state) => state.auth,

  getUser: createSelector(
    [(state) => state.auth.user],
    (user) => user
  ),
  getToken: (state) => state.auth.token,

  getIsAuthenticated: createSelector(
    [(state) => state.auth.isAuthenticated],
    (isAuthenticated) => isAuthenticated
  ),

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
