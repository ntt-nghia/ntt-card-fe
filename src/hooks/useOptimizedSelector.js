import { useSelector, shallowEqual } from 'react-redux';
import { useMemo } from 'react';
import {
  getMemoizedDeckRecommendations,
  getMemoizedSessionProgress,
  getMemoizedUserStats,
} from '@store/selectors/memoizedSelectors.js';

export const useOptimizedSelector = (selector, deps = []) => {
  const memoizedSelector = useMemo(() => selector, deps);
  return useSelector(memoizedSelector, shallowEqual);
};

// Enhanced selectors with better memoization
export const useGameProgress = () => {
  return useOptimizedSelector(getMemoizedSessionProgress);
};

export const useUserStats = () => {
  return useOptimizedSelector(getMemoizedUserStats);
};

export const useDeckRecommendations = () => {
  return useOptimizedSelector(getMemoizedDeckRecommendations);
};
