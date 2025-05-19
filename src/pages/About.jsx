import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { useTheme } from '@/context/ThemeContext';
import Card from '../components/common/Card';

const AboutContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  color: ${props => props.$theme.colors.primary};
  margin-bottom: 1rem;
`;

const CategoryDescription = styled.div`
  margin-bottom: 2rem;
`;

const CategoryTitle = styled.h3`
  color: ${props => props.$color};
  margin-bottom: 0.5rem;
`;

const QuestionExample = styled.div`
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 1rem;
  
  h4 {
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
  }
`;

const About = () => {
  const { theme } = useTheme();

  const categories = [
    {
      name: 'Colleague',
      color: '#003366',
      description: 'Professional but relaxed questions suitable for work relationships and team building.',
      examples: [
        'What professional skill do you admire most in your colleagues?',
        'What\s one work challenge you\'re currently facing?',
        'If you could change one thing about your workplace, what would it be?'
      ]
    },
    {
      name: 'Friend',
      color: '#ff9500',
      description: 'Casual, fun questions designed to strengthen friendships and encourage deeper connections.',
      examples: [
        'What\'s your favorite memory that we\'ve shared together?',
        'What\'s something you\'ve always wanted to do but haven\'t had the chance yet?',
        'How do you prefer to receive support from friends when you\'re going through a tough time?'
      ]
    },
    {
      name: 'Couple',
      color: '#8A2BE2',
      description: 'Thoughtful questions for romantic partners that balance playfulness with vulnerability.',
      examples: [
        'What makes you feel most loved and appreciated in our relationship?',
        'What\'s one thing you hope we can experience together in the future?',
        'How has your idea of love changed since we\'ve been together?'
      ]
    },
    {
      name: 'Intimate',
      color: '#800020',
      description: 'Deep, meaningful questions for close partners focused on trust, desire, and personal boundaries.',
      examples: [
        'What\'s something you\'ve always wanted to try but haven\'t had the courage to discuss?',
        'When do you feel most connected to me?',
        'What\'s one fantasy you\'d like to explore together?'
      ]
    }
  ];

  return (
    <AboutContainer>
      <Helmet>
        <title>About - Drinking Cards</title>
      </Helmet>

      <Section>
        <SectionTitle $theme={theme}>About Drinking Cards</SectionTitle>
        <p>
          Drinking Cards is a web application designed to strengthen connections between people through thoughtfully crafted questions.
          Whether you're building team rapport, deepening friendships, or enhancing romantic relationships, our categorized questions
          help guide meaningful conversations.
        </p>
      </Section>

      <Section>
        <SectionTitle $theme={theme}>How It Works</SectionTitle>
        <p>
          Players take turns answering questions that progressively deepen in intimacy and vulnerability.
          Each category is designed for a specific relationship context, and questions are rated from 1-5 in depth.
        </p>
        <p>
          The game starts with lighter questions and gradually introduces deeper topics, creating a natural
          progression that respects everyone's comfort level.
        </p>
      </Section>

      <Section>
        <SectionTitle $theme={theme}>Question Categories</SectionTitle>

        {categories.map((category) => (
          <CategoryDescription key={category.name}>
            <CategoryTitle $color={category.color}>{category.name}</CategoryTitle>
            <p>{category.description}</p>

            <QuestionExample>
              <h4>Example Questions:</h4>
              <ul>
                {category.examples.map((example, index) => (
                  <li key={index}>{example}</li>
                ))}
              </ul>
            </QuestionExample>
          </CategoryDescription>
        ))}
      </Section>

      <Section>
        <SectionTitle $theme={theme}>Playing Responsibly</SectionTitle>
        <Card padding="1.5rem" margin="1rem 0">
          <p>
            While Drinking Cards can enhance your social experiences, we encourage responsible play. Remember:
          </p>
          <ul>
            <li>Always respect others' boundaries and comfort levels</li>
            <li>It's perfectly fine to skip questions that feel too personal</li>
            <li>The goal is to create meaningful connections, not to pressure or embarrass</li>
            <li>If alcohol is involved, please drink responsibly</li>
          </ul>
        </Card>
      </Section>
    </AboutContainer>
  );
};

export default About;