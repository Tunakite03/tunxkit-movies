import type { MetadataRoute } from 'next';

import { fetchTrending, fetchPopular, fetchTopRated } from '@/services';
import { fetchTrendingTV, fetchPopularTV } from '@/services';
import { SITE_URL } from '@/constants';

/**
 * Generate a dynamic sitemap including static pages and
 * the most popular/trending movies & TV shows.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
   const now = new Date();

   /* ── Static pages ─────────────────────────────────────── */
   const staticPages: MetadataRoute.Sitemap = [
      { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
      { url: `${SITE_URL}/movies`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
      { url: `${SITE_URL}/tv`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
      { url: `${SITE_URL}/genres`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
      { url: `${SITE_URL}/watchlist`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
   ];

   /* ── Dynamic pages (trending / popular / top rated) ──── */
   // Gracefully degrade to static-only sitemap when TMDB is unavailable
   // (e.g. during CI builds where the API key is a placeholder).
   const moviePages: MetadataRoute.Sitemap = [];
   const tvPages: MetadataRoute.Sitemap = [];

   try {
      const [trending, popular, topRated, trendingTV, popularTV] = await Promise.all([
         fetchTrending(),
         fetchPopular(),
         fetchTopRated(),
         fetchTrendingTV(),
         fetchPopularTV(),
      ]);

      // Deduplicate movie IDs
      const movieIds = new Set<number>();
      for (const movie of [...trending.results, ...popular.results, ...topRated.results]) {
         if (movieIds.has(movie.id)) continue;
         movieIds.add(movie.id);
         moviePages.push({
            url: `${SITE_URL}/movies/${movie.id}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.7,
         });
      }

      // Deduplicate TV IDs
      const tvIds = new Set<number>();
      for (const show of [...trendingTV.results, ...popularTV.results]) {
         if (tvIds.has(show.id)) continue;
         tvIds.add(show.id);
         tvPages.push({
            url: `${SITE_URL}/tv/${show.id}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.7,
         });
      }
   } catch {
      // TMDB unavailable at build time — sitemap will only include static pages.
      // Dynamic entries will be present at runtime when the sitemap is regenerated.
   }

   return [...staticPages, ...moviePages, ...tvPages];
}
