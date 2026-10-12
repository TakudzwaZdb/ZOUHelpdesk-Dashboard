import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';

const THEMES = ['infographic', 'light', 'navy', 'dark', 'contrast'];
const STORAGE_KEY = 'helpdesk-dashboard-theme';

const ThemeContext = createContext(null);

function readInitialTheme() {
  const params = new URLSearchParams(window.location.search);
  const urlTheme = params.get('theme');
  if (urlTheme && THEMES.includes(urlTheme)) return urlTheme;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && THEMES.includes(saved)) return saved;
  return 'infographic';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme);
  // Chart colors are read from the live CSS variables *after* the theme
  // attribute is applied to <html>, then pushed into state. Every chart
  // component consumes these as normal props, so switching theme simply
  // triggers a normal React re-render — no imperative Chart.js instance
  // walking, no stale references, no ordering bugs.
  const [chartColors, setChartColors] = useState({ text: '#6f7a99', grid: 'rgba(143,154,184,.1)', panel: '#21222d' });

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const styles = getComputedStyle(document.documentElement);
    setChartColors({
      text: styles.getPropertyValue('--slate').trim(),
      grid: styles.getPropertyValue('--chart-grid').trim(),
      panel: styles.getPropertyValue('--panel').trim(),
    });
  }, [theme]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get('theme')) {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  function setTheme(name) {
    if (THEMES.includes(name)) setThemeState(name);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, chartColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
