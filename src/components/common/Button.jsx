import styled, { css } from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const StyledButton = styled.button`
  padding: ${props => props.$size === 'large' ? '0.875rem 2rem' : props.$size === 'small' ? '0.5rem 1rem' : '0.75rem 1.5rem'};
  font-size: ${props => props.$size === 'large' ? '1.125rem' : props.$size === 'small' ? '0.875rem' : '1rem'};
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  ${props => props.$variant === 'primary' && css`
    background-color: ${props.$theme.colors.primary};
    color: white;
    border: none;
    
    &:hover {
      background-color: ${props.$theme.colors.primary}dd;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  `}
  
  ${props => props.$variant === 'secondary' && css`
    background-color: transparent;
    color: ${props.$theme.colors.primary};
    border: 2px solid ${props.$theme.colors.primary};
    
    &:hover {
      background-color: ${props.$theme.colors.primary}11;
      transform: translateY(-2px);
    }
  `}
  
  ${props => props.$variant === 'text' && css`
    background-color: transparent;
    color: ${props.$theme.colors.primary};
    border: none;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    
    &:hover {
      text-decoration: underline;
    }
  `}
  
  ${props => props.$fullWidth && css`
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <StyledButton
      $theme={theme}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;