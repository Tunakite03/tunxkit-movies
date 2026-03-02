'use client';

import { Sun, Moon, Monitor } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store/theme-store';

/**
 * Theme toggle button that cycles through dark → light → system.
 */
export function ThemeToggle() {
   const { theme, setTheme } = useThemeStore();

   function handleToggle() {
      const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
      setTheme(nextTheme);
   }

   const icon =
      theme === 'dark' ? (
         <Moon className='size-4' />
      ) : theme === 'light' ? (
         <Sun className='size-4' />
      ) : (
         <Monitor className='size-4' />
      );

   const label = theme === 'dark' ? 'Chế độ tối' : theme === 'light' ? 'Chế độ sáng' : 'Theo hệ thống';

   return (
      <Button
         variant='ghost'
         size='icon'
         onClick={handleToggle}
         aria-label={label}
         title={label}
         className='size-9'
      >
         {icon}
      </Button>
   );
}
