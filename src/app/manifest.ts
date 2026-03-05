import type { MetadataRoute } from 'next';

import { SITE_NAME, SITE_DESCRIPTION } from '@/constants';

export default function manifest(): MetadataRoute.Manifest {
   return {
      name: SITE_NAME,
      short_name: 'TunxKit',
      description: SITE_DESCRIPTION,
      start_url: '/',
      display: 'standalone',
      background_color: '#09090b',
      theme_color: '#e11d48',
      icons: [
         { src: '/api/pwa-icon?size=192', sizes: '192x192', type: 'image/png' },
         { src: '/api/pwa-icon?size=512', sizes: '512x512', type: 'image/png' },
      ],
   };
}
