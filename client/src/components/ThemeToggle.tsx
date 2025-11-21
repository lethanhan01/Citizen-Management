import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';

const iconClasses = 'h-5 w-5 transition-transform duration-200';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none"
      aria-label="Chuyển chế độ sáng/tối"
    >
      {theme === 'light' ? (
        <>
          <Moon className={iconClasses} />
          <span>Chế độ tối</span>
        </>
      ) : (
        <>
          <Sun className={iconClasses} />
          <span>Chế độ sáng</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;

