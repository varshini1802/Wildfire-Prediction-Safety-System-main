import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../App';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 bg-black/60 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/10 dark:border-white/20 hover:bg-black/80 dark:hover:bg-white/20 transition-colors shadow-lg group"
      title="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-orange-400 group-hover:text-yellow-300 transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-slate-200 group-hover:text-blue-200 transition-colors" />
      )}
    </button>
  );
};

export default ThemeToggle;
