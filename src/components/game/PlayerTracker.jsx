import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const PlayerContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding: 0.5rem;
`;

const PlayerAvatar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 1rem;
  transition: transform 0.3s ease;
  
  ${props => props.$active && `
    transform: scale(1.1);
  `}
`;

const AvatarCircle = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => props.$active ? props.$theme.colors.primary : '#e0e0e0'};
  color: ${props => props.$active ? 'white' : '#666'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  box-shadow: ${props => props.$active ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none'};
`;

const PlayerName = styled.span`
  font-size: 0.9rem;
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
`;

const PlayerTracker = ({ players, currentPlayerIndex }) => {
  const { theme } = useTheme();

  return (
    <PlayerContainer>
      {players.map((player, index) => (
        <PlayerAvatar key={player.id} $active={index === currentPlayerIndex}>
          <AvatarCircle $active={index === currentPlayerIndex} $theme={theme}>
            {player.name.charAt(0).toUpperCase()}
          </AvatarCircle>
          <PlayerName $active={index === currentPlayerIndex}>
            {player.name}
          </PlayerName>
        </PlayerAvatar>
      ))}
    </PlayerContainer>
  );
};

export default PlayerTracker;