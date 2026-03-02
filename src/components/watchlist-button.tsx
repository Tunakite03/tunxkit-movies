'use client';

import { Heart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useWatchlistStore } from '@/store/watchlist-store';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/types';

interface WatchlistButtonProps {
   readonly item: MediaItem;
   /** 'icon' renders just the heart, 'full' renders with text */
   readonly variant?: 'icon' | 'full';
   readonly className?: string;
}

/**
 * Heart button to add/remove a media item from the watchlist.
 */
export function WatchlistButton({ item, variant = 'icon', className }: WatchlistButtonProps) {
   const { isInWatchlist, toggleWatchlist } = useWatchlistStore();
   const { isAuthenticated } = useAuthStore();
   const isActive = isInWatchlist(item.id, item.mediaType);

   function handleClick(e: React.MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      toggleWatchlist(item, isAuthenticated);
   }

   if (variant === 'full') {
      return (
         <Button
            variant={isActive ? 'default' : 'outline'}
            size='sm'
            onClick={handleClick}
            className={className}
            aria-label={isActive ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
         >
            <Heart className={cn('mr-2 size-4', isActive && 'fill-current')} />
            {isActive ? 'Đã yêu thích' : 'Yêu thích'}
         </Button>
      );
   }

   return (
      <button
         onClick={handleClick}
         suppressHydrationWarning
         className={cn(
            'flex size-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all hover:scale-110',
            isActive && 'bg-primary text-primary-foreground',
            className,
         )}
         aria-label={isActive ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
      >
         <Heart className={cn('size-4', isActive && 'fill-current')} />
      </button>
   );
}
