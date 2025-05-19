import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '@/context/ThemeContext';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: ${props => props.$theme.colors.primary};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #666;
  font-weight: 500;
  transition: color 0.2s;
  
  &:hover {
    color: ${props => props.$theme.colors.primary};
  }
`;

const StartButton = styled.button`
  padding: 0.5rem 1.25rem;
  background-color: ${props => props.$theme.colors.primary};
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$theme.colors.primary}dd;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const Header = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <HeaderContainer>
      <Logo to="/" $theme={theme}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 5H3a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V7a2 2 0 00-2-2z" stroke={theme.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 15V9M12 15V9M17 15V9" stroke={theme.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Drinking Cards
      </Logo>

      <Nav>
        <NavLink to="/about" $theme={theme}>About</NavLink>
        <StartButton $theme={theme} onClick={() => navigate('/categories')}>
          Start Game
        </StartButton>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;