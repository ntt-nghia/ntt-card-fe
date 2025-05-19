import { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '@/context/ThemeContext';

const CardWrapper = styled.div`
  position: relative;
  perspective: 1000px;
  margin: 2rem auto;
  width: 100%;
  max-width: 500px;
  height: 300px;
`;

const Card = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: ${props => props.$isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'};
  border-radius: ${props => props.$theme.borderRadius};
  box-shadow: ${props => props.$theme.boxShadow};
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: ${props => props.$theme.borderRadius};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  box-sizing: border-box;
`;

const CardFront = styled(CardFace)`
  background-color: ${props => props.$theme.colors.primary};
  color: white;
  
  h3 {
    margin-bottom: 2rem;
  }
`;

const CardBack = styled(CardFace)`
  background-color: white;
  transform: rotateY(180deg);
  
  h2 {
    color: ${props => props.$theme.colors.primary};
    margin-bottom: 1rem;
    text-align: center;
  }
  
  p {
    font-size: 1.2rem;
    text-align: center;
    line-height: 1.6;
  }
`;

const Depth = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  
  span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-left: 4px;
    background-color: ${props => props.$filled ? props.$theme.colors.accent : 'rgba(255, 255, 255, 0.3)'};
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
  
  background-color: ${props => props.$primary ? props.$theme.colors.primary : 'transparent'};
  color: ${props => props.$primary ? 'white' : props.$theme.colors.primary};
  border: ${props => props.$primary ? 'none' : `2px solid ${props.$theme.colors.primary}`};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const QuestionCard = ({ question, playerName, onAnswer, onSkip, canSkip }) => {
  const { theme } = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = () => {
    // Reset card to front side for next question
    setIsFlipped(false);
    onAnswer();
  };

  return (
    <CardWrapper>
      <Card $isFlipped={isFlipped} $theme={theme}>
        <CardFront $theme={theme}>
          <h3>{playerName}'s Question</h3>
          <p>Tap to reveal your question</p>

          <Depth $theme={theme}>
            {[...Array(5)].map((_, i) => (
              <span key={i} $filled={i < question.depth} $theme={theme} />
            ))}
          </Depth>

          <ActionButton
            $primary
            $theme={theme}
            onClick={handleFlip}
            style={{ marginTop: '2rem' }}
          >
            Reveal Question
          </ActionButton>
        </CardFront>

        <CardBack $theme={theme}>
          <h2>Question</h2>
          <p>{question.text}</p>

          <CardActions>
            {canSkip && (
              <ActionButton
                $theme={theme}
                onClick={onSkip}
              >
                Skip
              </ActionButton>
            )}
            <ActionButton
              $primary
              $theme={theme}
              onClick={handleAnswer}
            >
              Next Player
            </ActionButton>
          </CardActions>
        </CardBack>
      </Card>
    </CardWrapper>
  );
};

export default QuestionCard;