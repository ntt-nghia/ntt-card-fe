import styled from 'styled-components';

const FooterContainer = styled.footer`
  padding: 1.5rem;
  text-align: center;
  margin-top: auto;
  color: #666;
  font-size: 0.9rem;
`;

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <FooterContainer>
      <p>© {year} Drinking Cards. All rights reserved.</p>
      <p>Play responsibly.</p>
    </FooterContainer>
  );
};

export default Footer;