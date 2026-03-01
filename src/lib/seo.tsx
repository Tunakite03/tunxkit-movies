import { SITE_NAME, SITE_URL } from '@/constants';
import type { MovieDetail, TVShowDetail, PersonDetail } from '@/types';
import { getPosterUrl, getBackdropUrl, getProfileUrl } from '@/lib/image-utils';

/**
 * Render a JSON-LD `<script>` tag for structured data.
 * Accepts any JSON-serialisable schema object.
 */
export function JsonLd({ data }: { readonly data: Record<string, unknown> }) {
   return (
      <script
         type='application/ld+json'
         dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
   );
}

/** Website-level schema (placed in root layout) */
export function buildWebsiteSchema() {
   return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
         '@type': 'SearchAction',
         target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
         },
         'query-input': 'required name=search_term_string',
      },
   };
}

/** Movie detail page schema */
export function buildMovieSchema(movie: MovieDetail) {
   const poster = getPosterUrl(movie.poster_path, 'large');
   const backdrop = getBackdropUrl(movie.backdrop_path, 'large');

   return {
      '@context': 'https://schema.org',
      '@type': 'Movie',
      name: movie.title,
      description: movie.overview,
      image: poster,
      thumbnailUrl: backdrop,
      datePublished: movie.release_date || undefined,
      duration: movie.runtime ? `PT${movie.runtime}M` : undefined,
      aggregateRating:
         movie.vote_count > 0
            ? {
                 '@type': 'AggregateRating',
                 ratingValue: movie.vote_average.toFixed(1),
                 bestRating: '10',
                 ratingCount: movie.vote_count,
              }
            : undefined,
      genre: movie.genres?.map((g) => g.name),
      url: `${SITE_URL}/movies/${movie.id}`,
   };
}

/** TV show detail page schema */
export function buildTVShowSchema(show: TVShowDetail) {
   const poster = getPosterUrl(show.poster_path, 'large');

   return {
      '@context': 'https://schema.org',
      '@type': 'TVSeries',
      name: show.name,
      description: show.overview,
      image: poster,
      datePublished: show.first_air_date || undefined,
      numberOfSeasons: show.number_of_seasons,
      numberOfEpisodes: show.number_of_episodes,
      aggregateRating:
         show.vote_count > 0
            ? {
                 '@type': 'AggregateRating',
                 ratingValue: show.vote_average.toFixed(1),
                 bestRating: '10',
                 ratingCount: show.vote_count,
              }
            : undefined,
      genre: show.genres?.map((g) => g.name),
      url: `${SITE_URL}/tv/${show.id}`,
   };
}

/** Person/actor detail page schema */
export function buildPersonSchema(person: PersonDetail) {
   const photo = person.profile_path ? getProfileUrl(person.profile_path, 'original') : undefined;

   return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: person.name,
      image: photo,
      description: person.biography?.slice(0, 300) || undefined,
      birthDate: person.birthday || undefined,
      birthPlace: person.place_of_birth || undefined,
      url: `${SITE_URL}/people/${person.id}`,
   };
}

/** BreadcrumbList schema for nested pages */
export function buildBreadcrumbSchema(items: readonly { name: string; url: string }[]) {
   return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, i) => ({
         '@type': 'ListItem',
         position: i + 1,
         name: item.name,
         item: item.url,
      })),
   };
}
