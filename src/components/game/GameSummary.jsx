import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: ${props => props.$theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const ConfettiIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 2rem;
`;

const Stats = styled.div`
  width: 100%;
  margin: 1rem 0 2rem;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const PlayerList = styled.div`
  width: 100%;
  margin-bottom: 2rem;
`;

const Player = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  
  span {
    margin-left: 1rem;
  }
`;

const ActionButton = styled.button`
  padding: 0.75rem 2rem;
  background-color: ${props => props.$theme.colors.primary};
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const GameSummary = ({ gameSession, onExit }) => {
  const { theme } = useTheme();

  return (
    <SummaryContainer>
      <ConfettiIcon>🎉</ConfettiIcon>
      <Title $theme={theme}>Game Complete!</Title>

      <Stats>
        <StatRow>
          <strong>Category:</strong>
          <span>{gameSession.category}</span>
        </StatRow>
        <StatRow>
          <strong>Questions Asked:</strong>
          <span>{gameSession.askedQuestionIds.length}</span>
        </StatRow>
        <StatRow>
          <strong>Rounds Played:</strong>
          <span>{gameSession.currentRound} of {gameSession.maxRounds}</span>
        </StatRow>
        <StatRow>
          <strong>Duration:</strong>
          <span>
            {(() => {
              const startTime = new Date(gameSession.createdAt);
              const endTime = new Date(gameSession.updatedAt);
              const durationMs = endTime - startTime;
              const minutes = Math.floor(durationMs / 60000);
              const seconds = Math.floor((durationMs % 60000) / 1000);
              return `${minutes}m ${seconds}s`;
            })()}
          </span>
        </StatRow>
      </Stats>

      <h3>Players</h3>
      <PlayerList>
        {gameSession.players.map((player) => (
          <Player key={player.id}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: theme.colors.primary,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {player.name.charAt(0).toUpperCase()}
            </div>
            <span>{player.name}</span>
          </Player>
        ))}
      </PlayerList>

      <ActionButton $theme={theme} onClick={onExit}>
        Exit to Menu
      </ActionButton>
    </SummaryContainer>
  );
};

export default GameSummary;