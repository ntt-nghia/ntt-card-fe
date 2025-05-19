import styled from 'styled-components';

const ErrorContainer = styled.div`
  padding: 1rem;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  margin: 1rem 0;
  color: #c53030;
`;

const ErrorHeading = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const ErrorText = styled.p`
  margin: 0;
`;

const ErrorMessage = ({
  title = 'Error',
  message = 'Something went wrong. Please try again.'
}) => {
  return (
    <ErrorContainer>
      <ErrorHeading>{title}</ErrorHeading>
      <ErrorText>{message}</ErrorText>
    </ErrorContainer>
  );
};

export default ErrorMessage;