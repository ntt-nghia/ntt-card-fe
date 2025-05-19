import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGameSession,
  fetchNextQuestion,
  processAction
} from '@/redux/slices/gameSlice';

export const useGame = (gameId) => {
  const dispatch = useDispatch();
  const {
    gameSession,
    currentQuestion,
    currentPlayer,
    loading,
    error
  } = useSelector((state) => state.game);

  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (gameId) {
      dispatch(fetchGameSession(gameId));
    }
  }, [dispatch, gameId]);

  useEffect(() => {
    if (gameSession?.status === 'COMPLETED') {
      setIsGameOver(true);
    } else {
      setIsGameOver(false);
    }
  }, [gameSession]);

  const getNextQuestion = async () => {
    if (!gameId) return;

    try {
      await dispatch(fetchNextQuestion(gameId)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to fetch next question:', error);
      return false;
    }
  };

  const answerQuestion = async (questionId) => {
    if (!gameId || !questionId) return;

    try {
      const result = await dispatch(processAction({
        gameId,
        action: 'ANSWER',
        questionId
      })).unwrap();

      // If the game is still active, get the next question
      if (result.gameStatus === 'ACTIVE') {
        await getNextQuestion();
      } else if (result.gameStatus === 'COMPLETED') {
        setIsGameOver(true);
      }

      return result;
    } catch (error) {
      console.error('Failed to process action:', error);
      return null;
    }
  };

  const skipQuestion = async (questionId) => {
    if (!gameId || !questionId) return;

    try {
      const result = await dispatch(processAction({
        gameId,
        action: 'SKIP',
        questionId
      })).unwrap();

      // If the game is still active, get the next question
      if (result.gameStatus === 'ACTIVE') {
        await getNextQuestion();
      } else if (result.gameStatus === 'COMPLETED') {
        setIsGameOver(true);
      }

      return result;
    } catch (error) {
      console.error('Failed to process action:', error);
      return null;
    }
  };

  return {
    gameSession,
    currentQuestion,
    currentPlayer,
    loading,
    error,
    isGameOver,
    getNextQuestion,
    answerQuestion,
    skipQuestion
  };
};