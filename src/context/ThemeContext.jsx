import { createContext, useState, useContext, useEffect } from 'react';
import { colleagueTheme } from '../styles/themes/colleague';
import { friendTheme } from '../styles/themes/friend';
import { coupleTheme } from '../styles/themes/couple';
import { intimateTheme } from '../styles/themes/intimate';

export const ThemeContext = createContext(undefined);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [category, setCategory] = useState('FRIEND');
  const [theme, setTheme] = useState(friendTheme);

  useEffect(() => {
    switch (category) {
      case 'COLLEAGUE':
        setTheme(colleagueTheme);
        break;
      case 'FRIEND':
        setTheme(friendTheme);
        break;
      case 'COUPLE':
        setTheme(coupleTheme);
        break;
      case 'INTIMATE':
        setTheme(intimateTheme);
        break;
      default:
        setTheme(friendTheme);
    }

    // Update CSS variables for global theming
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });

    document.documentElement.style.setProperty('--font-family', theme.typography.fontFamily);
    document.documentElement.style.setProperty('--card-spacing', theme.spacing.card);

  }, [category, theme]);

  return (
    <ThemeContext.Provider value={{ theme, category, setCategory }}>
      {children}
    </ThemeContext.Provider>
  );
};