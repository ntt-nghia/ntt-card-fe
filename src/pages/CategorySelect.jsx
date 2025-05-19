import { Helmet } from 'react-helmet';
import CategorySelection from '../components/game/CategorySelection';

const CategorySelect = () => {
  return (
    <>
      <Helmet>
        <title>Select Category - Drinking Cards</title>
      </Helmet>
      <CategorySelection />
    </>
  );
};

export default CategorySelect;