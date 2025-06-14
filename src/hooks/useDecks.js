import { useDispatch, useSelector } from 'react-redux';
import { deckSelectors } from '@store/deck/deckSelectors';
import { deckActions } from '@store/deck/deckSlice';

export const useDecks = () => {
  const dispatch = useDispatch();
  const deckState = useSelector(deckSelectors.getDeckState);
  const allDecks = useSelector(deckSelectors.getAllDecks);
  const filteredDecks = useSelector(deckSelectors.getFilteredDecks);
  const currentDeck = useSelector(deckSelectors.getCurrentDeck);
  const deckCards = useSelector(deckSelectors.getDeckCards);
  const filters = useSelector(deckSelectors.getFilters);
  const pagination = useSelector(deckSelectors.getPagination);
  const isLoading = useSelector(deckSelectors.getIsLoading);
  const isUnlocking = useSelector(deckSelectors.getIsUnlocking);
  const error = useSelector(deckSelectors.getError);

  const getAllDecks = (filters, page = 1) => {
    dispatch(deckActions.getAllDecksRequest({ filters, page }));
  };

  const getDeckById = (deckId) => {
    dispatch(deckActions.getDeckByIdRequest({ deckId }));
  };

  const getDeckCards = (deckId, filters) => {
    dispatch(deckActions.getDeckCardsRequest({ deckId, filters }));
  };

  const unlockDeck = (deckId, transactionId, paymentMethod = 'stripe') => {
    dispatch(
      deckActions.unlockDeckRequest({
        deckId,
        transactionId,
        paymentMethod,
      }),
    );
  };

  const getDeckStatistics = (deckId) => {
    dispatch(deckActions.getDeckStatisticsRequest({ deckId }));
  };

  const setFilters = (newFilters) => {
    dispatch(deckActions.setFilters(newFilters));
  };

  const loadMoreDecks = () => {
    dispatch(deckActions.loadMoreDecks());
  };

  const clearCurrentDeck = () => {
    dispatch(deckActions.clearCurrentDeck());
  };

  const clearError = () => {
    dispatch(deckActions.clearError());
  };

  // Computed values
  const freeDecks = useSelector(deckSelectors.getFreeDecks);
  const premiumDecks = useSelector(deckSelectors.getPremiumDecks);
  const unlockedDecks = useSelector(deckSelectors.getUnlockedDecks);
  const lockedDecks = useSelector(deckSelectors.getLockedDecks);

  return {
    // State
    deckState,
    allDecks,
    filteredDecks,
    currentDeck,
    deckCards,
    filters,
    pagination,
    isLoading,
    isUnlocking,
    error,

    // Computed
    freeDecks,
    premiumDecks,
    unlockedDecks,
    lockedDecks,

    // Actions
    getAllDecks,
    getDeckById,
    getDeckCards,
    unlockDeck,
    getDeckStatistics,
    setFilters,
    loadMoreDecks,
    clearCurrentDeck,
    clearError,
  };
};
