import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ScrollProgress } from '@/components/scroll-progress';
import { ThemeProvider } from '@/store/theme-context';
import { WatchlistProvider } from '@/store/watchlist-context';
import { JsonLd, buildWebsiteSchema } from '@/lib/seo';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, SITE_KEYWORDS } from '@/constants';
import './globals.css';

const geistSans = Geist({
   variable: '--font-geist-sans',
   subsets: ['latin'],
});

const geistMono = Geist_Mono({
   variable: '--font-geist-mono',
   subsets: ['latin'],
});

export const viewport: Viewport = {
   themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#ffffff' },
      { media: '(prefers-color-scheme: dark)', color: '#09090b' },
   ],
   width: 'device-width',
   initialScale: 1,
};

export const metadata: Metadata = {
   metadataBase: new URL(SITE_URL),
   title: {
      default: `${SITE_NAME} - Khám phá thế giới điện ảnh`,
      template: `%s | ${SITE_NAME}`,
   },
   description: SITE_DESCRIPTION,
   keywords: [...SITE_KEYWORDS],
   authors: [{ name: 'TunxKit' }],
   creator: 'TunxKit',
   openGraph: {
      type: 'website',
      locale: 'vi_VN',
      url: SITE_URL,
      siteName: SITE_NAME,
      title: `${SITE_NAME} - Khám phá thế giới điện ảnh`,
      description: SITE_DESCRIPTION,
   },
   twitter: {
      card: 'summary_large_image',
      title: `${SITE_NAME} - Khám phá thế giới điện ảnh`,
      description: SITE_DESCRIPTION,
   },
   robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
   },
   alternates: {
      canonical: SITE_URL,
   },
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html
         lang='vi'
         className='dark'
         suppressHydrationWarning
      >
         <head>
            <script
               dangerouslySetInnerHTML={{
                  __html: `(function(){try{var t=localStorage.getItem('tunxkit-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}else if(t==='system'&&!window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}}catch(e){}})()`,
               }}
            />
         </head>
         <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <JsonLd data={buildWebsiteSchema()} />
            <ThemeProvider defaultTheme='dark'>
               <WatchlistProvider>
                  <ScrollProgress />
                  <div className='flex min-h-screen flex-col'>
                     <Header />
                     <main className='flex-1'>{children}</main>
                     <Footer />
                  </div>
               </WatchlistProvider>
            </ThemeProvider>
         </body>
      </html>
   );
}
