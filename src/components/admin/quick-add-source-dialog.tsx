'use client';

import { useState, useMemo, useCallback, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Plus, Loader2, Film, Tv, Wifi, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog';
import {
   createAdminVideoSource,
   createAdminTVSeason,
   getAdminTVShowDetail,
   getTmdbTVSeasons,
   searchTmdbMovies,
   searchTmdbTv,
} from '@/services/admin-dashboard-service';
import type {
   CreateVideoSourceData,
   CreateTVSeasonData,
   TmdbMovieSearchResult,
   TmdbTvSearchResult,
} from '@/services/admin-dashboard-service';
import { CreateSeasonDialog } from '@/components/admin/season-dialog';
import { useAuthStore } from '@/store/auth-store';
import { useDebounce } from '@/hooks';
import { IMAGE_SIZES } from '@/constants';

// ─── Form state ────────────────────────────────────────────

interface SourceFormState {
   mediaType: 'movie' | 'tv';
   mediaId: string;
   season: string;
   episode: string;
   sourceType: 'hls' | 'embed' | 'direct';
   sourceUrl: string;
   label: string;
   quality: string;
   language: string;
   priority: string;
}

const INITIAL_FORM: SourceFormState = {
   mediaType: 'movie',
   mediaId: '',
   season: '0',
   episode: '0',
   sourceType: 'embed',
   sourceUrl: '',
   label: '',
   quality: '1080p',
   language: 'Vietsub',
   priority: '0',
};

const SOURCE_TYPE_OPTIONS = [
   { value: 'embed', label: 'Embed (iframe)' },
   { value: 'hls', label: 'HLS (.m3u8)' },
   { value: 'direct', label: 'Direct (mp4)' },
] as const;

const QUALITY_OPTIONS = ['360p', '480p', '720p', '1080p', '4K'] as const;
const LANGUAGE_OPTIONS = ['Vietsub', 'Thuyết minh', 'EN', 'Raw'] as const;

// ─── Component ─────────────────────────────────────────────

interface QuickAddSourceDialogProps {
   readonly open: boolean;
   readonly onOpenChange: (open: boolean) => void;
   /** Pre-fill mediaType + mediaId when opened from a movie/tv row */
   readonly prefillMediaType?: 'movie' | 'tv';
   readonly prefillMediaId?: number;
   readonly prefillMediaTitle?: string;
}

type SelectedMedia =
   | { type: 'movie'; item: TmdbMovieSearchResult }
   | { type: 'tv'; item: TmdbTvSearchResult };

/** Quick dialog for adding a video source from the dashboard */
export function QuickAddSourceDialog({
   open,
   onOpenChange,
   prefillMediaType,
   prefillMediaId,
   prefillMediaTitle,
}: QuickAddSourceDialogProps) {
   const { token } = useAuthStore();
   const queryClient = useQueryClient();
   const [form, setForm] = useState<SourceFormState>(() => {
      const initialMediaType = prefillMediaType ?? 'movie';
      return {
         ...INITIAL_FORM,
         mediaType: initialMediaType,
         mediaId: prefillMediaId?.toString() ?? '',
         season: initialMediaType === 'tv' ? '' : INITIAL_FORM.season,
         episode: initialMediaType === 'tv' ? '' : INITIAL_FORM.episode,
      };
   });
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);
   const [successMessage, setSuccessMessage] = useState('');

   const debouncedQuery = useDebounce(searchQuery, 300);
   const isPrefill = !!prefillMediaId;
   const isTV = form.mediaType === 'tv';

   const parsedTvId = Number(form.mediaId);
   const selectedTvId = isTV && Number.isInteger(parsedTvId) && parsedTvId > 0 ? parsedTvId : null;

   const { data: movieResults, isLoading: isSearchingMovies } = useQuery({
      queryKey: ['admin-tmdb-search-movies', debouncedQuery, 1],
      queryFn: () => searchTmdbMovies(debouncedQuery, 1, token as string),
      enabled: !!token && form.mediaType === 'movie' && debouncedQuery.length >= 2 && !isPrefill,
   });

   const { data: tvResults, isLoading: isSearchingTv } = useQuery({
      queryKey: ['admin-tmdb-search-tv', debouncedQuery, 1],
      queryFn: () => searchTmdbTv(debouncedQuery, 1, token as string),
      enabled: !!token && form.mediaType === 'tv' && debouncedQuery.length >= 2 && !isPrefill,
   });

   const searchResults = form.mediaType === 'movie' ? movieResults?.results : tvResults?.results;
   const isSearching = form.mediaType === 'movie' ? isSearchingMovies : isSearchingTv;

   const { data: tvShowDetail, isLoading: isLoadingTvDetail } = useQuery({
      queryKey: ['admin-tv-show-detail', selectedTvId],
      queryFn: async () => {
         if (selectedTvId == null) {
            throw new Error('TV show ID is required');
         }
         return getAdminTVShowDetail(selectedTvId, token as string);
      },
      enabled: !!token && selectedTvId != null,
   });

   // Fallback: fetch seasons from TMDB when TV show is not in local DB
   const { data: tmdbSeasons, isLoading: isLoadingTmdbSeasons } = useQuery({
      queryKey: ['admin-tmdb-tv-seasons', selectedTvId],
      queryFn: () => getTmdbTVSeasons(selectedTvId as number, token as string),
      enabled: !!token && selectedTvId != null && !tvShowDetail && !isLoadingTvDetail,
   });

   const tvSeasons = useMemo(() => {
      const seasons = tvShowDetail?.seasons ?? tmdbSeasons?.seasons ?? [];
      return seasons
         .filter((season) => season.seasonNumber > 0)
         .sort((a, b) => a.seasonNumber - b.seasonNumber);
   }, [tvShowDetail?.seasons, tmdbSeasons?.seasons]);

   const selectedSeasonInfo = useMemo(() => {
      const seasonNumber = Number(form.season);
      if (!Number.isInteger(seasonNumber) || seasonNumber < 1) {
         return null;
      }
      return tvSeasons.find((season) => season.seasonNumber === seasonNumber) ?? null;
   }, [form.season, tvSeasons]);

   const episodeOptions = useMemo(() => {
      if (!selectedSeasonInfo || selectedSeasonInfo.episodeCount < 1) {
         return [];
      }
      return Array.from({ length: selectedSeasonInfo.episodeCount }, (_, index) => index + 1);
   }, [selectedSeasonInfo]);

   // Reset form when dialog opens/closes
   const handleOpenChange = useCallback(
      (nextOpen: boolean) => {
         if (nextOpen) {
            const initialMediaType = prefillMediaType ?? 'movie';
            setForm({
               ...INITIAL_FORM,
               mediaType: initialMediaType,
               mediaId: prefillMediaId?.toString() ?? '',
               season: initialMediaType === 'tv' ? '' : INITIAL_FORM.season,
               episode: initialMediaType === 'tv' ? '' : INITIAL_FORM.episode,
            });
            setSearchQuery('');
            setSelectedMedia(null);
            setSuccessMessage('');
         }
         onOpenChange(nextOpen);
      },
      [onOpenChange, prefillMediaType, prefillMediaId],
   );

   const handleChange = useCallback((field: keyof SourceFormState, value: string) => {
      if (field === 'mediaType') {
         const mediaType = value as SourceFormState['mediaType'];
         setSelectedMedia(null);
         setSearchQuery('');
         setForm((prev) => ({
            ...prev,
            mediaType,
            mediaId: '',
            season: mediaType === 'tv' ? '' : '0',
            episode: mediaType === 'tv' ? '' : '0',
         }));
         setSuccessMessage('');
         return;
      }

      if (field === 'season') {
         setForm((prev) => ({ ...prev, season: value, episode: '' }));
         setSuccessMessage('');
         return;
      }

      setForm((prev) => ({ ...prev, [field]: value }));
      setSuccessMessage('');
   }, []);

   const handleSelectMovie = useCallback((item: TmdbMovieSearchResult) => {
      setSelectedMedia({ type: 'movie', item });
      setForm((prev) => ({ ...prev, mediaId: String(item.id), season: '0', episode: '0' }));
      setSearchQuery('');
   }, []);

   const handleSelectTv = useCallback((item: TmdbTvSearchResult) => {
      setSelectedMedia({ type: 'tv', item });
      setForm((prev) => ({ ...prev, mediaId: String(item.id), season: '', episode: '' }));
      setSearchQuery('');
   }, []);

   const createSeasonMutation = useMutation({
      mutationFn: (data: CreateTVSeasonData) => {
         if (selectedTvId == null) {
            throw new Error('TV show ID is required');
         }
         return createAdminTVSeason(selectedTvId, data, token as string);
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-tv-show-detail', selectedTvId] });
         queryClient.invalidateQueries({ queryKey: ['admin-tmdb-tv-seasons', selectedTvId] });
      },
   });

   const createMutation = useMutation({
      mutationFn: (data: CreateVideoSourceData) => createAdminVideoSource(data, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
         queryClient.invalidateQueries({ queryKey: ['admin-video-sources'] });
         setSuccessMessage('✅ Thêm nguồn phát thành công!');
         setTimeout(() => {
            handleOpenChange(false);
         }, 1200);
      },
   });

   const handleSubmit = useCallback(
      (e: FormEvent) => {
         e.preventDefault();
         const mediaId = parseInt(form.mediaId, 10);
         const season = parseInt(form.season, 10);
         const episode = parseInt(form.episode, 10);

         if (!mediaId || !form.sourceUrl.trim()) return;
         if (
            form.mediaType === 'tv' &&
            (!Number.isInteger(season) || season < 1 || !Number.isInteger(episode) || episode < 1)
         ) {
            return;
         }

         createMutation.mutate({
            mediaType: form.mediaType,
            mediaId,
            season: form.mediaType === 'tv' ? season : 0,
            episode: form.mediaType === 'tv' ? episode : 0,
            sourceType: form.sourceType,
            sourceUrl: form.sourceUrl.trim(),
            label: form.label.trim() || undefined,
            quality: form.quality || undefined,
            language: form.language || undefined,
            priority: parseInt(form.priority, 10) || 0,
         });
      },
      [form, createMutation],
   );

   const isTvSelectionValid = !isTV || (Number(form.season) > 0 && Number(form.episode) > 0);

   return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
         <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleSubmit}>
               <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                     <Wifi className="h-5 w-5 text-emerald-500" />
                     Thêm nguồn phát nhanh
                  </DialogTitle>
                  <DialogDescription>
                     {prefillMediaTitle
                        ? `Thêm nguồn phát cho "${prefillMediaTitle}"`
                        : 'Thêm nguồn phát video cho phim lẻ hoặc phim bộ.'}
                  </DialogDescription>
               </DialogHeader>

               <div className="mt-5 grid gap-4">
                  {/* Media type toggle */}
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Loại media</label>
                     <div className="flex gap-2">
                        <Button
                           type="button"
                           size="sm"
                           variant={form.mediaType === 'movie' ? 'default' : 'outline'}
                           className="flex-1"
                           onClick={() => handleChange('mediaType', 'movie')}
                        >
                           <Film className="mr-1.5 h-4 w-4" /> Phim lẻ
                        </Button>
                        <Button
                           type="button"
                           size="sm"
                           variant={form.mediaType === 'tv' ? 'default' : 'outline'}
                           className="flex-1"
                           onClick={() => handleChange('mediaType', 'tv')}
                        >
                           <Tv className="mr-1.5 h-4 w-4" /> Phim bộ
                        </Button>
                     </div>
                  </div>

                  {/* Media picker (search or prefill) */}
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        Chọn phim <span className="text-destructive">*</span>
                     </label>
                     {isPrefill ? (
                        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                           <div className="flex h-12 w-8 shrink-0 items-center justify-center rounded bg-muted">
                              <Film className="h-5 w-5 text-muted-foreground" />
                           </div>
                           <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{prefillMediaTitle}</p>
                              <p className="text-xs text-muted-foreground">ID: {prefillMediaId}</p>
                           </div>
                        </div>
                     ) : selectedMedia ? (
                        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                           <MediaPoster media={selectedMedia} />
                           <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                 {selectedMedia.type === 'movie'
                                    ? selectedMedia.item.title
                                    : selectedMedia.item.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                 ID: {selectedMedia.item.id}
                                 {selectedMedia.type === 'movie'
                                    ? selectedMedia.item.releaseDate
                                       ? ` • ${selectedMedia.item.releaseDate.slice(0, 4)}`
                                       : ''
                                    : selectedMedia.item.firstAirDate
                                      ? ` • ${selectedMedia.item.firstAirDate.slice(0, 4)}`
                                      : ''}
                              </p>
                           </div>
                           <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                 setSelectedMedia(null);
                                 setForm((prev) => ({ ...prev, mediaId: '' }));
                              }}
                           >
                              Đổi
                           </Button>
                        </div>
                     ) : (
                        <div className="space-y-2">
                           <div className="relative">
                              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                 placeholder={
                                    form.mediaType === 'movie'
                                       ? 'Tìm phim: Fight Club, Inception...'
                                       : 'Tìm phim bộ: Breaking Bad, Game of Thrones...'
                                 }
                                 value={searchQuery}
                                 onChange={(e) => setSearchQuery(e.target.value)}
                                 className="pl-9"
                              />
                           </div>
                           {debouncedQuery.length >= 2 && (
                              <div className="max-h-[200px] overflow-y-auto rounded-lg border border-border">
                                 {isSearching ? (
                                    <div className="flex items-center justify-center py-4">
                                       <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    </div>
                                 ) : searchResults?.length ? (
                                    form.mediaType === 'movie' ? (
                                       (searchResults as TmdbMovieSearchResult[]).map((item) => (
                                          <button
                                             key={item.id}
                                             type="button"
                                             className="flex w-full items-center gap-3 overflow-hidden px-3 py-2 text-left transition-colors hover:bg-accent"
                                             onClick={() => handleSelectMovie(item)}
                                          >
                                             <MediaPosterItem
                                                posterPath={item.posterPath}
                                                alt={item.title}
                                             />
                                             <div className="min-w-0 flex-1">
                                                <p className="line-clamp-2 text-sm font-medium">
                                                   {item.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                   {item.releaseDate?.slice(0, 4) ?? '—'}
                                                </p>
                                             </div>
                                          </button>
                                       ))
                                    ) : (
                                       (searchResults as TmdbTvSearchResult[]).map((item) => (
                                          <button
                                             key={item.id}
                                             type="button"
                                             className="flex w-full items-center gap-3 overflow-hidden px-3 py-2 text-left transition-colors hover:bg-accent"
                                             onClick={() => handleSelectTv(item)}
                                          >
                                             <MediaPosterItem
                                                posterPath={item.posterPath}
                                                alt={item.name}
                                             />
                                             <div className="min-w-0 flex-1">
                                                <p className="line-clamp-2 text-sm font-medium">
                                                   {item.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                   {item.firstAirDate?.slice(0, 4) ?? '—'}
                                                </p>
                                             </div>
                                          </button>
                                       ))
                                    )
                                 ) : (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                       Không tìm thấy
                                    </p>
                                 )}
                              </div>
                           )}
                        </div>
                     )}
                  </div>

                  {/* Season & Episode (TV only) */}
                  {isTV && (
                     <div className="space-y-2">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">Season</label>
                              <select
                                 className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                 value={form.season}
                                 onChange={(e) => handleChange('season', e.target.value)}
                                 disabled={
                                    !selectedTvId ||
                                    isLoadingTvDetail ||
                                    isLoadingTmdbSeasons ||
                                    tvSeasons.length === 0
                                 }
                              >
                                 <option value="">
                                    {isLoadingTvDetail || isLoadingTmdbSeasons
                                       ? 'Đang tải season...'
                                       : !selectedTvId
                                         ? 'Chọn phim bộ trước'
                                         : tvSeasons.length === 0
                                           ? 'Không có season'
                                           : 'Chọn season'}
                                 </option>
                                 {tvSeasons.map((season) => (
                                    <option key={season.id} value={String(season.seasonNumber)}>
                                       Mùa {season.seasonNumber} ({season.episodeCount} tập)
                                    </option>
                                 ))}
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">Episode</label>
                              <select
                                 className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                 value={form.episode}
                                 onChange={(e) => handleChange('episode', e.target.value)}
                                 disabled={!form.season || episodeOptions.length === 0}
                              >
                                 <option value="">
                                    {!form.season
                                       ? 'Chọn season trước'
                                       : episodeOptions.length === 0
                                         ? 'Không có episode'
                                         : 'Chọn episode'}
                                 </option>
                                 {episodeOptions.map((ep) => (
                                    <option key={ep} value={String(ep)}>
                                       Tập {ep}
                                    </option>
                                 ))}
                              </select>
                           </div>
                        </div>

                        {/* Add season button when no seasons */}
                        {selectedTvId != null &&
                           !isLoadingTvDetail &&
                           !isLoadingTmdbSeasons &&
                           tvSeasons.length === 0 && (
                              <div className="col-span-full">
                                 <CreateSeasonDialog
                                    mediaTitle={
                                       selectedMedia?.type === 'tv'
                                          ? selectedMedia.item.name
                                          : (prefillMediaTitle ?? `TV #${selectedTvId}`)
                                    }
                                    onSubmit={(data) => createSeasonMutation.mutate(data)}
                                    isPending={createSeasonMutation.isPending}
                                    isSuccess={createSeasonMutation.isSuccess}
                                 />
                              </div>
                           )}
                     </div>
                  )}

                  {/* Source Type */}
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Loại nguồn</label>
                     <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={form.sourceType}
                        onChange={(e) =>
                           handleChange(
                              'sourceType',
                              e.target.value as SourceFormState['sourceType'],
                           )
                        }
                     >
                        {SOURCE_TYPE_OPTIONS.map((opt) => (
                           <option key={opt.value} value={opt.value}>
                              {opt.label}
                           </option>
                        ))}
                     </select>
                  </div>

                  {/* Source URL */}
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        URL nguồn phát <span className="text-destructive">*</span>
                     </label>
                     <Input
                        value={form.sourceUrl}
                        onChange={(e) => handleChange('sourceUrl', e.target.value)}
                        placeholder="https://..."
                        required
                     />
                  </div>

                  {/* Quality, Language, Label row */}
                  <div className="grid grid-cols-3 gap-3">
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Chất lượng</label>
                        <select
                           className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                           value={form.quality}
                           onChange={(e) => handleChange('quality', e.target.value)}
                        >
                           {QUALITY_OPTIONS.map((q) => (
                              <option key={q} value={q}>
                                 {q}
                              </option>
                           ))}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Ngôn ngữ</label>
                        <select
                           className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                           value={form.language}
                           onChange={(e) => handleChange('language', e.target.value)}
                        >
                           {LANGUAGE_OPTIONS.map((l) => (
                              <option key={l} value={l}>
                                 {l}
                              </option>
                           ))}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Nhãn</label>
                        <Input
                           value={form.label}
                           onChange={(e) => handleChange('label', e.target.value)}
                           placeholder="Server 1"
                        />
                     </div>
                  </div>
               </div>

               {/* Success message */}
               {successMessage && (
                  <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-500">
                     {successMessage}
                  </div>
               )}

               {/* Error message */}
               {createMutation.isError && (
                  <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                     {(createMutation.error as Error)?.message ?? 'Có lỗi xảy ra'}
                  </div>
               )}

               <DialogFooter className="mt-6">
                  <Button
                     type="button"
                     variant="outline"
                     onClick={() => handleOpenChange(false)}
                     disabled={createMutation.isPending}
                  >
                     Hủy
                  </Button>
                  <Button
                     type="submit"
                     disabled={
                        createMutation.isPending ||
                        !form.mediaId ||
                        !form.sourceUrl.trim() ||
                        !isTvSelectionValid
                     }
                     className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                     {createMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : (
                        <Plus className="mr-2 h-4 w-4" />
                     )}
                     Thêm nguồn phát
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}

// ─── Helpers ───────────────────────────────────────────────────

function MediaPoster({ media }: { readonly media: SelectedMedia }) {
   const posterPath = media.type === 'movie' ? media.item.posterPath : media.item.posterPath;
   const alt = media.type === 'movie' ? media.item.title : media.item.name;
   return <MediaPosterItem posterPath={posterPath} alt={alt} />;
}

function MediaPosterItem({
   posterPath,
   alt,
}: {
   readonly posterPath: string | null;
   readonly alt: string;
}) {
   const size = { w: 32, h: 48 };
   if (posterPath) {
      return (
         <Image
            src={`${IMAGE_SIZES.poster.small}${posterPath}`}
            alt={alt}
            width={size.w}
            height={size.h}
            className="shrink-0 rounded object-cover"
            style={{ height: 'auto' }}
         />
      );
   }
   return (
      <div
         className="flex shrink-0 items-center justify-center rounded bg-muted"
         style={{ width: size.w, height: size.h }}
      >
         <Film className="h-5 w-5 text-muted-foreground" />
      </div>
   );
}
