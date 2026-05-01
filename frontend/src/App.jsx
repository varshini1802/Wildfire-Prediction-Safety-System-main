import React, { createContext, useContext, useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';

// Define the theme context
export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <div className="w-screen h-screen font-sans overflow-hidden bg-slate-50 dark:bg-[#030712] transition-colors duration-500">
        <Dashboard />
      </div>
    </ThemeProvider>
  );
}

export default App;