'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, useEffect } from 'react';
import { Film, Search, Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { SITE_NAME } from '@/constants';

const NAV_LINKS = [
   { href: '/', label: 'Trang chủ' },
   { href: '/movies', label: 'Phim lẻ' },
   { href: '/tv', label: 'Phim bộ' },
   { href: '/genres', label: 'Thể loại' },
   { href: '/watchlist', label: 'Yêu thích' },
] as const;

export function Header() {
   const router = useRouter();
   const [searchQuery, setSearchQuery] = useState('');
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const [isScrolled, setIsScrolled] = useState(false);

   function handleSearch(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const trimmed = searchQuery.trim();
      if (!trimmed) return;
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
   }
   useEffect(() => {
      let lastScrollY = window.scrollY;

      const handleScroll = () => {
         const currentScrollY = window.scrollY;

         setIsScrolled(currentScrollY > 50);

         lastScrollY = currentScrollY;
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   return (
      <header
         className={`sticky top-0 z-50 bg-background/70 backdrop-blur-md transition-transform duration-300 ${isScrolled ? 'border-b border-border' : ''}`}
      >
         <div className='container mx-auto flex items-center justify-between gap-4 px-4 py-3 md:px-6'>
            {/* Logo */}
            <Link
               href='/'
               className='flex items-center gap-2 shrink-0'
            >
               <Film className='size-6 text-primary' />
               <span className='text-lg font-bold tracking-tight'>{SITE_NAME}</span>
            </Link>

            {/* Desktop Nav */}
            <nav className='hidden items-center gap-1 md:flex'>
               {NAV_LINKS.map((link) => (
                  <Button
                     key={link.href}
                     variant='ghost'
                     size='sm'
                     asChild
                  >
                     <Link href={link.href}>{link.label}</Link>
                  </Button>
               ))}
            </nav>

            {/* Desktop Search */}
            <form
               onSubmit={handleSearch}
               className='hidden max-w-sm flex-1 items-center gap-2 md:flex'
            >
               <div className='relative flex-1'>
                  <Search className='absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                     type='search'
                     placeholder='Tìm kiếm phim...'
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className='pl-9'
                  />
               </div>
            </form>

            {/* Theme Toggle + User Menu + Mobile Menu Toggle */}
            <div className='flex items-center gap-1'>
               <ThemeToggle />
               <UserMenu />
               <Button
                  variant='ghost'
                  size='icon'
                  className='md:hidden'
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
               >
                  {isMobileMenuOpen ? <X className='size-5' /> : <Menu className='size-5' />}
               </Button>
            </div>
         </div>

         {/* Mobile Menu */}
         {isMobileMenuOpen && (
            <div className='border-t border-border px-4 pb-4 md:hidden'>
               <form
                  onSubmit={handleSearch}
                  className='mb-3 mt-3'
               >
                  <div className='relative'>
                     <Search className='absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                     <Input
                        type='search'
                        placeholder='Tìm kiếm phim...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='pl-9'
                     />
                  </div>
               </form>
               <nav className='flex flex-col gap-1'>
                  {NAV_LINKS.map((link) => (
                     <Button
                        key={link.href}
                        variant='ghost'
                        size='sm'
                        className='justify-start'
                        asChild
                        onClick={() => setIsMobileMenuOpen(false)}
                     >
                        <Link href={link.href}>{link.label}</Link>
                     </Button>
                  ))}
               </nav>
            </div>
         )}
      </header>
   );
}
