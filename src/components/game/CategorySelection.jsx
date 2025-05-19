import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { CATEGORIES } from '../../utils/categories';
import styled from 'styled-components';

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const CategoryCard = styled.div`
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  img {
    width: 100%;
    height: 160px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  
  h3 {
    color: ${props => props.$cardColor};
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #666;
    margin-bottom: 1rem;
  }
`;

const CategorySelection = () => {
  const navigate = useNavigate();
  const { setCategory } = useTheme();

  const handleCategorySelect = (categoryKey) => {
    setCategory(categoryKey);
    navigate(`/setup/${categoryKey.toLowerCase()}`);
  };

  return (
    <div>
      <h2>Select a question category</h2>
      <p>Choose the category that best fits your group's relationship</p>

      <CategoryGrid>
        {CATEGORIES.map((category) => (
          <CategoryCard
            key={category.key}
            $cardColor={category.color}
            onClick={() => handleCategorySelect(category.key)}
          >
            <img src={`/assets/category-images/${category.key.toLowerCase()}.svg`} alt={category.name} />
            <h3>{category.name}</h3>
            <p>{category.description}</p>
          </CategoryCard>
        ))}
      </CategoryGrid>
    </div>
  );
};

export default CategorySelection;