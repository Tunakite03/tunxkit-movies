import type { Metadata } from 'next';

export const metadata: Metadata = {
   title: 'Yêu thích',
   description: 'Danh sách phim yêu thích của bạn.',
   robots: { index: false, follow: false },
};

export default function WatchlistLayout({ children }: { readonly children: React.ReactNode }) {
   return children;
}
