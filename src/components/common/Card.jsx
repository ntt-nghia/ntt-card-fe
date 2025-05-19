import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const StyledCard = styled.div`
  background-color: white;
  border-radius: ${props => props.$theme.borderRadius};
  box-shadow: ${props => props.$theme.boxShadow};
  padding: ${props => props.$padding || '1.5rem'};
  margin: ${props => props.$margin || '0'};
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  transition: ${props => props.$theme.transition};
  
  ${props => props.$clickable && `
    cursor: pointer;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
  `}
`;

const Card = ({
  children,
  padding,
  margin,
  fullWidth = false,
  clickable = false,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <StyledCard
      $theme={theme}
      $padding={padding}
      $margin={margin}
      $fullWidth={fullWidth}
      $clickable={clickable}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

export default Card;