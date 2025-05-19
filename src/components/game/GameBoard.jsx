import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {fetchGameSession, fetchNextQuestion, processAction} from '@/redux/slices/gameSlice';
import PlayerTracker from './PlayerTracker';
import QuestionCard from './QuestionCard';
import GameSummary from './GameSummary';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import styled from 'styled-components';

const GameContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 70vh;
`;

const GameHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
`;

const GameInfo = styled.div`
    text-align: right;

    p {
        margin: 0.25rem 0;
    }
`;

const GameBoard = ({gameId}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {gameSession, currentQuestion, currentPlayer, loading, error} = useSelector((state) => state.game);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    dispatch(fetchGameSession(gameId));
  }, [dispatch, gameId]);

  useEffect(() => {
    if (gameSession && gameSession.status === 'ACTIVE') {
      dispatch(fetchNextQuestion(gameId));
    } else if (gameSession && gameSession.status === 'COMPLETED') {
      setShowSummary(true);
    }
  }, [dispatch, gameId, gameSession]);

  const handleAnswer = () => {
    if (currentQuestion) {
      dispatch(processAction({
        gameId,
        action: 'ANSWER',
        questionId: currentQuestion.id
      }))
        .then(() => {
          // Check if the game is still active
          if (gameSession.status === 'ACTIVE') {
            dispatch(fetchNextQuestion(gameId));
          }
        });
    }
  };

  const handleSkip = () => {
    if (currentQuestion && gameSession?.settings?.allowSkips) {
      dispatch(processAction({
        gameId,
        action: 'SKIP',
        questionId: currentQuestion.id
      }))
        .then(() => {
          // Check if the game is still active
          if (gameSession.status === 'ACTIVE') {
            dispatch(fetchNextQuestion(gameId));
          }
        });
    }
  };

  const exitGame = () => {
    navigate('/categories');
  };

  if (loading && !gameSession) {
    return <Loading/>;
  }

  if (error) {
    return <ErrorMessage message={error.error || 'Failed to load game'}/>;
  }

  if (showSummary) {
    return <GameSummary gameSession={gameSession} onExit={exitGame}/>;
  }

  if (!gameSession) {
    return <ErrorMessage message="Game session not found"/>;
  }

  return (
    <GameContainer>
      <GameHeader>
        <h2>{gameSession.category.toLowerCase().replace(/_/g, ' ')} Questions</h2>
        <GameInfo>
          <p>Round {gameSession.currentRound} of {gameSession.maxRounds}</p>
          <p>Questions asked: {gameSession.askedQuestionIds.length}</p>
        </GameInfo>
      </GameHeader>

      <PlayerTracker
        players={gameSession.players}
        currentPlayerIndex={gameSession.currentPlayerIndex}
      />

      {currentQuestion && currentPlayer ? (
        <QuestionCard
          question={currentQuestion}
          playerName={currentPlayer.name}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
          canSkip={gameSession.settings.allowSkips}
        />
      ) : (
        <div>
          <Loading/>
          <p>Loading next question...</p>
        </div>
      )}

      <button onClick={exitGame}>Exit Game</button>
    </GameContainer>
  );
};

export default GameBoard;