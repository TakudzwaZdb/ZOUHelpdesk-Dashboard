import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const SWATCHES = {
  infographic: '#21222d',
  light: '#f5f6f9',
  navy: '#16244a',
  dark: '#1a1a20',
  contrast: '#ffffff',
};

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  return (
    <div className="flex gap-1.5 ml-4" title="Theme">
      {themes.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setTheme(t)}
          title={t.charAt(0).toUpperCase() + t.slice(1)}
          aria-label={`${t} theme`}
          className={`w-[22px] h-[22px] rounded-full border-2 cursor-pointer transition-all hover:opacity-100 hover:scale-110 ${
            theme === t ? 'opacity-100 border-ink shadow-[0_0_0_2px_var(--bg),0_0_0_3px_var(--ink)]' : 'opacity-70 border-panelBorder'
          }`}
          style={{ background: SWATCHES[t], borderColor: t === 'contrast' ? '#000' : undefined }}
        />
      ))}
    </div>
  );
}
