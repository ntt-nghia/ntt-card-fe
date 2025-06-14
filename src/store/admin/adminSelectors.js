import { createSelector } from '@reduxjs/toolkit';

const selectAdminState = (state) => state.admin;

export const adminSelectors = {
  // Basic selectors
  getAdminState: selectAdminState,

  getCards: (state) => selectAdminState(state).cards,
  getGeneratedCards: (state) => selectAdminState(state).generatedCards,
  getCurrentCard: (state) => selectAdminState(state).currentCard,

  getPagination: (state) => selectAdminState(state).pagination,
  getFilters: (state) => selectAdminState(state).filters,

  getDecks: (state) => selectAdminState(state).decks,
  getCurrentDeck: (state) => selectAdminState(state).currentDeck,

  getUsers: (state) => selectAdminState(state).users,
  getCurrentUser: (state) => selectAdminState(state).currentUser,

  getAnalytics: (state) => selectAdminState(state).analytics,
  getGenerationAnalytics: (state) => selectAdminState(state).generationAnalytics,
  getDeckAnalytics: (state) => selectAdminState(state).deckAnalytics,

  getIsLoading: (state) => selectAdminState(state).isLoading,
  getIsGenerating: (state) => selectAdminState(state).isGenerating,
  getIsSaving: (state) => selectAdminState(state).isSaving,
  getError: (state) => selectAdminState(state).error,

  // Computed selectors
  getFilteredCards: createSelector(
    [selectAdminState],
    (adminState) => {
      const { cards, filters } = adminState;

      return cards.filter(card => {
        // Apply client-side filtering if needed
        if (filters.status && card.status !== filters.status) return false;
        if (filters.type && card.type !== filters.type) return false;
        // Add more filter logic as needed
        return true;
      });
    }
  ),

  getCardsByStatus: createSelector(
    [selectAdminState],
    (adminState) => {
      const { cards } = adminState;

      return {
        active: cards.filter(card => card.status === 'active'),
        draft: cards.filter(card => card.status === 'draft'),
        review: cards.filter(card => card.status === 'review'),
        archived: cards.filter(card => card.status === 'archived'),
      };
    }
  ),

  getGenerationProgress: createSelector(
    [selectAdminState],
    (adminState) => {
      const { isGenerating, generatedCards } = adminState;

      return {
        isGenerating,
        generatedCount: generatedCards.length,
        hasGenerated: generatedCards.length > 0,
      };
    }
  ),

  getPaginationInfo: createSelector(
    [selectAdminState],
    (adminState) => {
      const { pagination, cards } = adminState;

      return {
        ...pagination,
        currentCount: cards.length,
        hasMore: pagination.hasMore,
        canLoadMore: pagination.hasMore && !adminState.isLoading,
      };
    }
  ),
};
