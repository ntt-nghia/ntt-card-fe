import {useParams} from 'react-router-dom';
import {useEffect} from 'react';
import {Helmet} from 'react-helmet';
import {useTheme} from '@/context/ThemeContext';
import GameSetup from '../components/game/GameSetup';

const GameSetupPage = () => {
  const {category} = useParams();
  const {setCategory} = useTheme();

  useEffect(() => {
    const formattedCategory = category.toUpperCase();
    setCategory(formattedCategory);
  }, [category, setCategory]);

  return (
    <>
      <Helmet>
        <title>Game Setup - Drinking Cards</title>
      </Helmet>
      <h1>Game Setup</h1>
      <p>Configure your game settings and add players</p>
      <GameSetup category={category.toUpperCase()}/>
    </>
  );
};

export default GameSetupPage;
