import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';

const iconClasses = 'h-5 w-5 transition-transform duration-200';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-4xl px-4 py-2 text-sm font-semibold bg-first text-white dark:bg-third dark:text-first ring-2 ring-white/20 hover:ring-4 hover:ring-white active:scale-95 transition"
      aria-label="Chuyển chế độ sáng/tối"
    >
      {theme === 'light' ? (
        <>
          <Moon className={iconClasses} />
          <span>Dark</span>
        </>
      ) : (
        <>
          <Sun className={iconClasses} />
          <span>Light</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;






