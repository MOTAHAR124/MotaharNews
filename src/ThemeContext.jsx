import React, { createContext, useEffect, useMemo, useState } from 'react';

export const ThemeContext = createContext({ isDark: false, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const getInitial = () => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    // fallback to system
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [isDark, setIsDark] = useState(getInitial);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', isDark);
    document.documentElement.classList.toggle('theme-light', !isDark);
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    // notify listeners
    window.dispatchEvent(new CustomEvent('themechange', { detail: { isDark } }));
  }, [isDark]);

  useEffect(() => {
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (!mq) return;
    const handle = (e) => {
      const saved = localStorage.getItem('theme');
      if (!saved) setIsDark(e.matches);
    };
    mq.addEventListener ? mq.addEventListener('change', handle) : mq.addListener(handle);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', handle) : mq.removeListener(handle);
    };
  }, []);

  const value = useMemo(() => ({ isDark, toggleTheme: () => setIsDark((v) => !v) }), [isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
