import styled, { keyframes } from 'styled-components';
import { useTheme } from '@/context/ThemeContext';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 2rem;
`;

const Spinner = styled.div`
  width: ${props => props.$size === 'large' ? '60px' : props.$size === 'small' ? '24px' : '40px'};
  height: ${props => props.$size === 'large' ? '60px' : props.$size === 'small' ? '24px' : '40px'};
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: ${props => props.$theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-top: 1rem;
  color: #666;
`;

const Loading = ({ size = 'medium', text = 'Loading...' }) => {
  const { theme } = useTheme();

  return (
    <LoadingContainer>
      <Spinner $size={size} $theme={theme} />
      {text && <LoadingText>{text}</LoadingText>}
    </LoadingContainer>
  );
};

export default Loading;