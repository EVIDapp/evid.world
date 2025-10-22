import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="shadow-elevated backdrop-blur-strong gradient-card border-border/50 
                 h-8 w-8 md:h-9 md:w-9 p-0 transition-bounce hover:shadow-glow hover:border-primary/30 hover:scale-105"
    >
      {theme === 'dark' ? (
        <Sun className="w-3.5 h-3.5 md:w-4 md:h-4" />
      ) : (
        <Moon className="w-3.5 h-3.5 md:w-4 md:h-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
