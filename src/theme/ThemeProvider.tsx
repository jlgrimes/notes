import React, { createContext, useContext } from 'react';
import * as tokens from './tokens';

type Theme = typeof tokens;

const ThemeContext = createContext<Theme | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ThemeContext.Provider value={tokens}>{children}</ThemeContext.Provider>
  );
};
