import styled from 'styled-components';

const Container = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const PageContainer = ({ children }) => {
  return (
    <Container>
      {children}
    </Container>
  );
};

export default PageContainer;