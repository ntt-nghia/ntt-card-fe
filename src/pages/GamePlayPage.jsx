import {useParams} from 'react-router-dom';
import {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {Helmet} from 'react-helmet';
import {useTheme} from '@/context/ThemeContext';
import GameBoard from '../components/game/GameBoard';
import Loading from '../components/common/Loading';

const GamePlayPage = () => {
  const {gameId} = useParams();
  const {gameSession} = useSelector((state) => state.game);
  const {setCategory} = useTheme();

  useEffect(() => {
    // Set theme based on game category when game session is loaded
    if (gameSession && gameSession.category) {
      setCategory(gameSession.category);
    }
  }, [gameSession, setCategory]);

  if (!gameId) {
    return <div>Invalid game ID</div>;
  }

  return (
    <>
      <Helmet>
        <title>Playing Game - Drinking Cards</title>
      </Helmet>
      {!gameSession ? (
        <Loading text="Loading game..."/>
      ) : (
        <GameBoard gameId={gameId}/>
      )}
    </>
  );
};

export default GamePlayPage;