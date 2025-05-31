import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { userSelectors } from '@store/user/userSelectors';
import { userActions } from '@store/user/userSlice';

export const useUser = () => {
  const dispatch = useDispatch();
  const userState = useSelector(userSelectors.getUserState);
  const profile = useSelector(userSelectors.getProfile);
  const statistics = useSelector(userSelectors.getStatistics);
  const preferences = useSelector(userSelectors.getPreferences);
  const unlockedDecks = useSelector(userSelectors.getUnlockedDecks);
  const purchaseHistory = useSelector(userSelectors.getPurchaseHistory);
  const isLoading = useSelector(userSelectors.getIsLoading);
  const error = useSelector(userSelectors.getError);

  const getProfile = () => {
    dispatch(userActions.getUserProfileRequest());
  };

  const updateProfile = (profileData) => {
    dispatch(userActions.updateUserProfileRequest(profileData));
  };

  const updatePreferences = (preferences) => {
    dispatch(userActions.updateUserPreferencesRequest(preferences));
  };

  const updateLanguage = (language) => {
    dispatch(userActions.updateLanguageRequest({ language }));
  };

  const getStatistics = () => {
    dispatch(userActions.getUserStatisticsRequest());
  };

  const recordGameCompletion = (gameData) => {
    dispatch(userActions.recordGameCompletionRequest(gameData));
  };

  const getUserDecks = (filters) => {
    dispatch(userActions.getUserDecksRequest(filters));
  };

  const getPurchaseHistory = () => {
    dispatch(userActions.getPurchaseHistoryRequest());
  };

  const deleteAccount = () => {
    dispatch(userActions.deleteAccountRequest());
  };

  const clearError = () => {
    dispatch(userActions.clearError());
  };

  return {
    // State
    userState,
    profile,
    statistics,
    preferences,
    unlockedDecks,
    purchaseHistory,
    isLoading,
    error,

    // Actions
    getProfile,
    updateProfile,
    updatePreferences,
    updateLanguage,
    getStatistics,
    recordGameCompletion,
    getUserDecks,
    getPurchaseHistory,
    deleteAccount,
    clearError,
  };
};
