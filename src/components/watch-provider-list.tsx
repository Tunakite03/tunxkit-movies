import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

import { TMDB_IMAGE_BASE } from '@/constants';
import type { WatchProvider, WatchProviderRegion } from '@/types';

interface WatchProviderListProps {
   readonly providers: WatchProviderRegion | undefined;
}

/** Render one section of providers (streaming, rent, buy, etc.) */
function ProviderSection({
   title,
   items,
}: {
   readonly title: string;
   readonly items: readonly WatchProvider[] | undefined;
}) {
   if (!items || items.length === 0) return null;

   return (
      <div className='space-y-2'>
         <h4 className='text-sm font-medium text-muted-foreground'>{title}</h4>
         <div className='flex flex-wrap gap-3'>
            {items.map((provider) => (
               <div
                  key={provider.provider_id}
                  className='flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2'
                  title={provider.provider_name}
               >
                  <Image
                     src={`${TMDB_IMAGE_BASE}/w92${provider.logo_path}`}
                     alt={provider.provider_name}
                     width={32}
                     height={32}
                     className='rounded'
                  />
                  <span className='text-sm font-medium'>{provider.provider_name}</span>
               </div>
            ))}
         </div>
      </div>
   );
}

/**
 * Displays streaming, rent, and buy provider options from TMDB.
 * Shows a link to the TMDB provider page for the user's region.
 */
export function WatchProviderList({ providers }: WatchProviderListProps) {
   if (!providers) {
      return (
         <div className='rounded-lg border border-border bg-card p-6 text-center'>
            <p className='text-muted-foreground'>Không có thông tin nhà cung cấp tại khu vực của bạn.</p>
         </div>
      );
   }

   const hasAny =
      (providers.flatrate?.length ?? 0) > 0 ||
      (providers.rent?.length ?? 0) > 0 ||
      (providers.buy?.length ?? 0) > 0 ||
      (providers.ads?.length ?? 0) > 0;

   if (!hasAny) {
      return (
         <div className='rounded-lg border border-border bg-card p-6 text-center'>
            <p className='text-muted-foreground'>Không có nhà cung cấp nào cho khu vực này.</p>
         </div>
      );
   }

   return (
      <div className='space-y-4'>
         <ProviderSection
            title='🎬 Xem trực tuyến (Streaming)'
            items={providers.flatrate}
         />
         <ProviderSection
            title='🎟️ Thuê (Rent)'
            items={providers.rent}
         />
         <ProviderSection
            title='🛒 Mua (Buy)'
            items={providers.buy}
         />
         <ProviderSection
            title='📺 Miễn phí có quảng cáo'
            items={providers.ads}
         />

         {providers.link && (
            <a
               href={providers.link}
               target='_blank'
               rel='noopener noreferrer'
               className='inline-flex items-center gap-1.5 text-sm text-primary hover:underline'
            >
               <ExternalLink className='size-3.5' />
               Xem tất cả tùy chọn trên TMDB
            </a>
         )}

         <p className='text-xs text-muted-foreground'>
            Dữ liệu nhà cung cấp được cung cấp bởi JustWatch thông qua TMDB.
         </p>
      </div>
   );
}
