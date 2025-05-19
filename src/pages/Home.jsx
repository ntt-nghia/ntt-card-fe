import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '@/context/ThemeContext';
import Button from '../components/common/Button';
import { CATEGORIES } from '../utils/categories';

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 3rem 0;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${props => props.$theme.colors.primary};
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 2rem;
  max-width: 600px;
`;

const Categories = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const CategoryCard = styled.div`
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const CategoryContent = styled.div`
  padding: 1.5rem;
  
  h3 {
    color: ${props => props.$color};
    margin-bottom: 0.75rem;
  }
  
  p {
    color: #666;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
`;

const FeatureCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 1.5rem;
    color: ${props => props.$theme.colors.primary};
  }
  
  h3 {
    margin-bottom: 1rem;
  }
  
  p {
    color: #666;
  }
`;

const Home = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <>
      <Hero>
        <Title $theme={theme}>Strengthen Your Connections</Title>
        <Subtitle>
          A card game designed to deepen relationships through meaningful questions across different relationship types.
        </Subtitle>
        <Button
          size="large"
          onClick={() => navigate('/categories')}
        >
          Start Playing
        </Button>
      </Hero>

      <h2>Choose Your Category</h2>
      <Categories>
        {CATEGORIES.map((category) => (
          <CategoryCard key={category.key}>
            <img
              src={`/assets/category-images/${category.key.toLowerCase()}.svg`}
              alt={category.name}
              style={{ width: '100%', height: '160px', objectFit: 'cover' }}
            />
            <CategoryContent $color={category.color}>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  navigate(`/setup/${category.key.toLowerCase()}`);
                }}
              >
                Play {category.name}
              </Button>
            </CategoryContent>
          </CategoryCard>
        ))}
      </Categories>

      <h2>How It Works</h2>
      <Features>
        <FeatureCard $theme={theme}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Add Players</h3>
          <p>Enter player names and customize game settings to match your group.</p>
        </FeatureCard>

        <FeatureCard $theme={theme}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 2v4M8 2v4M1 10h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Answer Questions</h3>
          <p>Take turns answering questions designed to spark meaningful conversations.</p>
        </FeatureCard>

        <FeatureCard $theme={theme}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Grow Together</h3>
          <p>Each round goes deeper, strengthening your relationships through shared understanding.</p>
        </FeatureCard>
      </Features>
    </>
  );
};

export default Home;