// ─── Movie Service ───────────────────────────────────────────
export {
   fetchTrending,
   fetchMoviesByCategory,
   fetchPopular,
   fetchNowPlaying,
   fetchTopRated,
   fetchUpcoming,
   fetchMovieDetail,
   fetchMovieCredits,
   fetchMovieVideos,
   fetchSimilarMovies,
   fetchMoviesByGenre,
   discoverMovies,
   fetchMovieWatchProviders,
} from './movie-service';

// ─── TV Service ──────────────────────────────────────────────
export {
   fetchTrendingTV,
   fetchTVByCategory,
   fetchPopularTV,
   fetchAiringTodayTV,
   fetchTopRatedTV,
   fetchOnTheAirTV,
   fetchTVDetail,
   fetchTVCredits,
   fetchTVVideos,
   fetchSimilarTV,
   fetchTVByGenre,
   discoverTV,
   fetchTVWatchProviders,
} from './tv-service';

// ─── Search & Genre Service ─────────────────────────────────
export { searchMovies, searchTV, searchMulti, fetchGenres, fetchTVGenres } from './search-service';

// ─── Person Service ─────────────────────────────────────────
export { fetchPersonDetail, fetchPersonCredits } from './person-service';
