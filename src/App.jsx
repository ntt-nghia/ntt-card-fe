import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PageContainer from './components/layout/PageContainer';
import Home from './pages/Home';
import CategorySelect from './pages/CategorySelect';
import GameSetupPage from './pages/GameSetupPage';
import GamePlayPage from './pages/GamePlayPage';
import About from './pages/About';

function App() {
  return (
    <ThemeProvider>
      <Header />
      <PageContainer>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<CategorySelect />} />
          <Route path="/setup/:category" element={<GameSetupPage />} />
          <Route path="/play/:gameId" element={<GamePlayPage />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </PageContainer>
      <Footer />
    </ThemeProvider>
  );
}

export default App;