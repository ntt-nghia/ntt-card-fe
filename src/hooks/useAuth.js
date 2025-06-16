import { useDispatch, useSelector } from 'react-redux';
import { authSelectors } from '@store/auth/authSelectors';
import { authActions } from '@store/auth/authSlice';
import { useMemo } from 'react';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector(authSelectors.getAuthState);
  const user = useSelector(authSelectors.getUser);
  const isAuthenticated = useSelector(authSelectors.getIsAuthenticated);
  const isLoading = useSelector(authSelectors.getIsLoading);
  const error = useSelector(authSelectors.getError);
  const isAdmin = useSelector(authSelectors.getIsAdmin);

  const login = (credentials) => {
    dispatch(authActions.loginRequest(credentials));
  };

  const register = (userData) => {
    dispatch(authActions.registerRequest(userData));
  };

  const logout = () => {
    dispatch(authActions.logoutRequest());
  };

  const updateProfile = (profileData) => {
    dispatch(authActions.updateProfileRequest(profileData));
  };

  const forgotPassword = (email) => {
    dispatch(authActions.forgotPasswordRequest({ email }));
  };

  const clearError = () => {
    dispatch(authActions.clearError());
  };

  const actions = useMemo(() => ({
    login: (credentials) => dispatch(authActions.loginRequest(credentials)),
    register: (userData) => dispatch(authActions.registerRequest(userData)),
    logout: () => dispatch(authActions.logoutRequest()),
    updateProfile: (profileData) => dispatch(authActions.updateProfileRequest(profileData)),
    forgotPassword: (email) => dispatch(authActions.forgotPasswordRequest({ email })),
    clearError: () => dispatch(authActions.clearError()),
  }), [dispatch]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    authState,

    // Actions
    ...actions,
  };
};
