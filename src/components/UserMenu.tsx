import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { User, Sun, Moon, Monitor, LogOut } from 'lucide-react';

export function UserMenu() {
  const { state, dispatch } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
  };

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(state.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    dispatch({ type: 'SET_THEME', payload: themes[nextIndex] });
  };

  const themeIcon = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  }[state.theme];
  const ThemeIcon = themeIcon;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-line flex items-center justify-center hover:bg-brand-soft transition-colors"
      >
        <User size={14} className="text-ink-secondary" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-line rounded-card shadow-pop animate-pop-in">
          <div className="p-2">
            <button
              onClick={cycleTheme}
              className="w-full flex items-center gap-2 px-3 py-2 text-body text-ink hover:bg-canvas rounded-card transition-colors"
            >
              <ThemeIcon size={14} />
              <span>Theme: {state.theme}</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-body text-ink hover:bg-canvas rounded-card transition-colors"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
