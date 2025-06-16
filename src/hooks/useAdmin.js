// src/hooks/useAdmin.js - Custom hook for admin functionality
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { adminSelectors } from '@store/admin/adminSelectors';
import { adminActions } from '@store/admin/adminSlice';

export const useAdmin = () => {
  const dispatch = useDispatch();

  // Admin state
  const adminState = useSelector(adminSelectors.getAdminState);
  const cards = useSelector(adminSelectors.getCards);
  const generatedCards = useSelector(adminSelectors.getGeneratedCards);
  const pagination = useSelector(adminSelectors.getPagination);
  const filters = useSelector(adminSelectors.getFilters);
  const isLoading = useSelector(adminSelectors.getIsLoading);
  const isGenerating = useSelector(adminSelectors.getIsGenerating);
  const error = useSelector(adminSelectors.getError);
  const generationAnalytics = useSelector(adminSelectors.getGenerationAnalytics);

  // Card management actions
  const getAllCards = useCallback((params) => {
    dispatch(adminActions.getAllCardsRequest(params));
  }, [dispatch]);

  const getCard = useCallback((cardId) => {
    dispatch(adminActions.getCardRequest({ cardId }));
  }, [dispatch]);

  const createCard = useCallback((cardData) => {
    dispatch(adminActions.createCardRequest(cardData));
  }, [dispatch]);

  const updateCard = useCallback((cardId, updates) => {
    dispatch(adminActions.updateCardRequest({ cardId, updates }));
  }, [dispatch]);

  const deleteCard = useCallback((cardId) => {
    dispatch(adminActions.deleteCardRequest({ cardId }));
  }, [dispatch]);

  const bulkDeleteCards = useCallback((cardIds) => {
    dispatch(adminActions.bulkDeleteCardsRequest({ cardIds }));
  }, [dispatch]);

  const archiveCard = useCallback((cardId) => {
    dispatch(adminActions.archiveCardRequest({ cardId }));
  }, [dispatch]);

  const duplicateCard = useCallback((cardId) => {
    dispatch(adminActions.duplicateCardRequest({ cardId }));
  }, [dispatch]);

  // Card generation actions
  const generateCards = useCallback((params) => {
    dispatch(adminActions.generateCardsRequest(params));
  }, [dispatch]);

  const batchGenerateCards = useCallback((configurations, theta) => {
    dispatch(adminActions.batchGenerateCardsRequest({ configurations, theta }));
  }, [dispatch]);

  const regenerateCard = useCallback((cardId, params) => {
    dispatch(adminActions.regenerateCardRequest({ cardId, params }));
  }, [dispatch]);

  const clearGeneratedCards = useCallback(() => {
    dispatch(adminActions.clearGeneratedCards());
  }, [dispatch]);

  // Deck management actions
  const getAllDecks = useCallback((params) => {
    dispatch(adminActions.getAllDecksRequest(params));
  }, [dispatch]);

  const createDeck = useCallback((deckData) => {
    dispatch(adminActions.createDeckRequest(deckData));
  }, [dispatch]);

  const updateDeck = useCallback((deckId, updates) => {
    dispatch(adminActions.updateDeckRequest({ deckId, updates }));
  }, [dispatch]);

  const deleteDeck = useCallback((deckId) => {
    dispatch(adminActions.deleteDeckRequest({ deckId }));
  }, [dispatch]);

  const addCardsToDeck = useCallback((deckId, cardIds) => {
    dispatch(adminActions.addCardsToDeckRequest({ deckId, cardIds }));
  }, [dispatch]);

  const removeCardsFromDeck = useCallback((deckId, cardIds) => {
    dispatch(adminActions.removeCardsFromDeckRequest({ deckId, cardIds }));
  }, [dispatch]);

  // Analytics actions
  const getAnalytics = useCallback((filters) => {
    dispatch(adminActions.getAnalyticsRequest(filters));
  }, [dispatch]);

  const getDeckAnalytics = useCallback((deckId, filters) => {
    dispatch(adminActions.getDeckAnalyticsRequest({ deckId, filters }));
  }, [dispatch]);

  const getGenerationAnalytics = useCallback(() => {
    dispatch(adminActions.getGenerationAnalyticsRequest());
  }, [dispatch]);

  // User management actions
  const getAllUsers = useCallback((params) => {
    dispatch(adminActions.getAllUsersRequest(params));
  }, [dispatch]);

  const updateUser = useCallback((userId, updates) => {
    dispatch(adminActions.updateUserRequest({ userId, updates }));
  }, [dispatch]);

  const deleteUser = useCallback((userId) => {
    dispatch(adminActions.deleteUserRequest({ userId }));
  }, [dispatch]);

  // Filter and UI actions
  const setFilters = useCallback((filters) => {
    dispatch(adminActions.setFilters(filters));
  }, [dispatch]);

  const clearFilters = useCallback(() => {
    dispatch(adminActions.clearFilters());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(adminActions.clearError());
  }, [dispatch]);

  // Export/Import actions
  const exportCards = useCallback((params) => {
    dispatch(adminActions.exportCardsRequest(params));
  }, [dispatch]);

  const importCards = useCallback((file, options) => {
    dispatch(adminActions.importCardsRequest({ file, options }));
  }, [dispatch]);

  return {
    // State
    adminState,
    cards,
    generatedCards,
    pagination,
    filters,
    isLoading,
    isGenerating,
    error,
    generationAnalytics,

    // Card Management
    getAllCards,
    getCard,
    createCard,
    updateCard,
    deleteCard,
    bulkDeleteCards,
    archiveCard,
    duplicateCard,

    // Card Generation
    generateCards,
    batchGenerateCards,
    regenerateCard,
    clearGeneratedCards,

    // Deck Management
    getAllDecks,
    createDeck,
    updateDeck,
    deleteDeck,
    addCardsToDeck,
    removeCardsFromDeck,

    // Analytics
    getAnalytics,
    getDeckAnalytics,
    getGenerationAnalytics,

    // User Management
    getAllUsers,
    updateUser,
    deleteUser,

    // Filters and UI
    setFilters,
    clearFilters,
    clearError,

    // Export/Import
    exportCards,
    importCards,
  };
};
