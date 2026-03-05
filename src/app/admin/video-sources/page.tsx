'use client';

import { useState, useCallback, useMemo, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import {
   PlayCircle,
   Plus,
   Trash2,
   Edit,
   Search,
   Loader2,
   Film,
   Globe,
   Play,
   Tv,
   Video,
   X,
} from 'lucide-react';

import {
   getAdminVideoSources,
   createAdminVideoSource,
   updateAdminVideoSource,
   deleteAdminVideoSource,
   searchTmdbMovies,
   searchTmdbTv,
   getAdminTVShowDetail,
   getTmdbTVSeasons,
   createAdminTVSeason,
} from '@/services/admin-dashboard-service';
import type {
   AdminVideoSource,
   AdminSeasonItem,
   CreateVideoSourceData,
   UpdateVideoSourceData,
   CreateTVSeasonData,
   TmdbMovieSearchResult,
   TmdbTvSearchResult,
} from '@/services/admin-dashboard-service';
import { useAuthStore } from '@/store/auth-store';
import { useDebounce } from '@/hooks';
import { IMAGE_SIZES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table';
import { AdminPageHeader } from '@/components/admin/admin-shared';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

// ─── Source type helpers ─────────────────────────────────────

const SOURCE_TYPE_LABELS = {
   hls: 'HLS (.m3u8)',
   embed: 'Embed (iframe)',
   direct: 'Direct (mp4)',
} as const;

function SourceTypeIcon({ type }: { readonly type: AdminVideoSource['sourceType'] }) {
   switch (type) {
      case 'hls':
         return <Play className="mr-1 size-3.5" />;
      case 'embed':
         return <Globe className="mr-1 size-3.5" />;
      case 'direct':
         return <Film className="mr-1 size-3.5" />;
   }
}

// ─── Search form ─────────────────────────────────────────────

interface SearchState {
   mediaType: 'movie' | 'tv';
   mediaId: string;
   season: string;
   episode: string;
}

const INITIAL_SEARCH: SearchState = {
   mediaType: 'movie',
   mediaId: '',
   season: '',
   episode: '',
};

type SelectedMedia =
   | { readonly type: 'movie'; readonly item: TmdbMovieSearchResult }
   | { readonly type: 'tv'; readonly item: TmdbTvSearchResult };

// ─── Create / Edit form ─────────────────────────────────────

interface SourceFormState {
   sourceType: 'hls' | 'embed' | 'direct';
   sourceUrl: string;
   label: string;
   quality: string;
   language: string;
   priority: string;
}

const INITIAL_FORM: SourceFormState = {
   sourceType: 'embed',
   sourceUrl: '',
   label: '',
   quality: '',
   language: '',
   priority: '0',
};

/** Build form from an existing source for editing */
function buildFormFromSource(source: AdminVideoSource): SourceFormState {
   return {
      sourceType: source.sourceType,
      sourceUrl: source.sourceUrl,
      label: source.label,
      quality: source.quality,
      language: source.language,
      priority: String(source.priority),
   };
}

// ─── Main page component ────────────────────────────────────

export default function AdminVideoSourcesPage() {
   const { token } = useAuthStore();
   const queryClient = useQueryClient();

   // Search state
   const [search, setSearch] = useState<SearchState>(INITIAL_SEARCH);
   const [activeSearch, setActiveSearch] = useState<SearchState | null>(null);

   // Title search for media picker
   const [titleSearch, setTitleSearch] = useState('');
   const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);
   const debouncedTitleSearch = useDebounce(titleSearch, 300);

   // Dialog state
   const [isCreateOpen, setIsCreateOpen] = useState(false);
   const [editTarget, setEditTarget] = useState<AdminVideoSource | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<AdminVideoSource | null>(null);

   // Quick-create season dialog
   const [isSeasonDialogOpen, setIsSeasonDialogOpen] = useState(false);
   const [seasonForm, setSeasonForm] = useState({ name: '', seasonNumber: '1', episodeCount: '1' });

   // Form state (shared between create and edit)
   const [form, setForm] = useState<SourceFormState>(INITIAL_FORM);

   const queryKey = activeSearch
      ? [
           'admin-video-sources',
           activeSearch.mediaType,
           activeSearch.mediaId,
           activeSearch.season,
           activeSearch.episode,
        ]
      : null;

   const { data, isLoading } = useQuery({
      queryKey: queryKey ?? ['admin-video-sources-empty'],
      queryFn: () => {
         if (!activeSearch || !token) return { sources: [] as AdminVideoSource[], total: 0 };
         return getAdminVideoSources(
            activeSearch.mediaType,
            Number(activeSearch.mediaId),
            token,
            activeSearch.season ? Number(activeSearch.season) : undefined,
            activeSearch.episode ? Number(activeSearch.episode) : undefined,
         );
      },
      enabled: !!token && !!activeSearch && !!activeSearch.mediaId,
   });

   const { data: movieSearchData, isLoading: isSearchingMovies } = useQuery({
      queryKey: ['admin-tmdb-search-movies', debouncedTitleSearch],
      queryFn: () => searchTmdbMovies(debouncedTitleSearch, 1, token as string),
      enabled: !!token && search.mediaType === 'movie' && debouncedTitleSearch.length >= 2,
   });

   const { data: tvSearchData, isLoading: isSearchingTv } = useQuery({
      queryKey: ['admin-tmdb-search-tv', debouncedTitleSearch],
      queryFn: () => searchTmdbTv(debouncedTitleSearch, 1, token as string),
      enabled: !!token && search.mediaType === 'tv' && debouncedTitleSearch.length >= 2,
   });

   const titleSearchResults =
      search.mediaType === 'movie' ? movieSearchData?.results : tvSearchData?.results;
   const isSearchingTitle = search.mediaType === 'movie' ? isSearchingMovies : isSearchingTv;

   // Fetch TV show details when a TV show is selected → gives us real season list
   const selectedTvId = selectedMedia?.type === 'tv' ? selectedMedia.item.id : null;

   const { data: tvDetail, isLoading: isLoadingTvDetail } = useQuery({
      queryKey: ['admin-tv-show-detail', selectedTvId],
      queryFn: () => getAdminTVShowDetail(selectedTvId as number, token as string),
      enabled: !!token && selectedTvId != null,
   });

   // Fallback: fetch seasons from TMDB when TV show is not in local DB
   const { data: tmdbSeasons, isLoading: isLoadingTmdbSeasons } = useQuery({
      queryKey: ['admin-tmdb-tv-seasons', selectedTvId],
      queryFn: () => getTmdbTVSeasons(selectedTvId as number, token as string),
      enabled: !!token && selectedTvId != null && !tvDetail && !isLoadingTvDetail,
   });

   const tvSeasons = useMemo<readonly AdminSeasonItem[]>(() => {
      const seasons = tvDetail?.seasons ?? tmdbSeasons?.seasons ?? [];
      return seasons
         .filter((s) => s.seasonNumber > 0)
         .sort((a, b) => a.seasonNumber - b.seasonNumber);
   }, [tvDetail?.seasons, tmdbSeasons?.seasons]);

   const selectedSeasonInfo = useMemo(
      () => tvSeasons.find((s) => s.seasonNumber === Number(search.season)) ?? null,
      [tvSeasons, search.season],
   );

   const episodeOptions = useMemo(
      () =>
         selectedSeasonInfo
            ? Array.from({ length: selectedSeasonInfo.episodeCount }, (_, i) => i + 1)
            : [],
      [selectedSeasonInfo],
   );

   const createMutation = useMutation({
      mutationFn: (payload: CreateVideoSourceData) =>
         createAdminVideoSource(payload, token as string),
      onSuccess: () => {
         if (queryKey) queryClient.invalidateQueries({ queryKey });
         setIsCreateOpen(false);
         setForm(INITIAL_FORM);
      },
   });

   const updateMutation = useMutation({
      mutationFn: ({ id, data: payload }: { id: string; data: UpdateVideoSourceData }) =>
         updateAdminVideoSource(id, payload, token as string),
      onSuccess: () => {
         if (queryKey) queryClient.invalidateQueries({ queryKey });
         setEditTarget(null);
         setForm(INITIAL_FORM);
      },
   });

   const deleteMutation = useMutation({
      mutationFn: (id: string) => deleteAdminVideoSource(id, token as string),
      onSuccess: () => {
         if (queryKey) queryClient.invalidateQueries({ queryKey });
         setDeleteTarget(null);
      },
   });

   const createSeasonMutation = useMutation({
      mutationFn: (payload: { tvShowId: number; data: CreateTVSeasonData }) =>
         createAdminTVSeason(payload.tvShowId, payload.data, token as string),
      onSuccess: () => {
         if (selectedTvId != null) {
            queryClient.invalidateQueries({ queryKey: ['admin-tv-show-detail', selectedTvId] });
         }
         setIsSeasonDialogOpen(false);
         setSeasonForm({ name: '', seasonNumber: '1', episodeCount: '1' });
      },
   });

   // ─── Handlers ──────────────────────────────────────────────

   const handleMediaTypeChange = useCallback((value: string) => {
      const mediaType = value as 'movie' | 'tv';
      setSearch((prev) => ({ ...prev, mediaType, mediaId: '', season: '', episode: '' }));
      setSelectedMedia(null);
      setTitleSearch('');
   }, []);

   const handleSelectMovie = useCallback((item: TmdbMovieSearchResult) => {
      setSelectedMedia({ type: 'movie', item });
      setSearch((prev) => ({ ...prev, mediaId: String(item.id) }));
      setTitleSearch('');
   }, []);

   const handleSelectTv = useCallback((item: TmdbTvSearchResult) => {
      setSelectedMedia({ type: 'tv', item });
      setSearch((prev) => ({ ...prev, mediaId: String(item.id), season: '', episode: '' }));
      setTitleSearch('');
   }, []);

   const handleClearMedia = useCallback(() => {
      setSelectedMedia(null);
      setSearch((prev) => ({ ...prev, mediaId: '', season: '', episode: '' }));
   }, []);

   const handleSeasonChange = useCallback((value: string) => {
      setSearch((prev) => ({ ...prev, season: value, episode: '' }));
   }, []);

   const handleEpisodeSelect = useCallback((ep: number) => {
      setSearch((prev) => ({ ...prev, episode: String(ep) }));
   }, []);

   const handleOpenSeasonDialog = useCallback(() => {
      const nextNumber =
         tvSeasons.length > 0 ? Math.max(...tvSeasons.map((s) => s.seasonNumber)) + 1 : 1;
      setSeasonForm({
         name: `Season ${nextNumber}`,
         seasonNumber: String(nextNumber),
         episodeCount: '1',
      });
      setIsSeasonDialogOpen(true);
   }, [tvSeasons]);

   const handleCreateSeason = useCallback(
      (e: FormEvent) => {
         e.preventDefault();
         if (selectedTvId == null) return;
         const seasonNumber = Number(seasonForm.seasonNumber);
         const episodeCount = Number(seasonForm.episodeCount);
         if (!seasonForm.name.trim() || seasonNumber < 1 || episodeCount < 0) return;

         createSeasonMutation.mutate({
            tvShowId: selectedTvId,
            data: { name: seasonForm.name.trim(), seasonNumber, episodeCount },
         });
      },
      [selectedTvId, seasonForm, createSeasonMutation],
   );

   const handleSearch = useCallback(
      (e: FormEvent) => {
         e.preventDefault();
         if (!search.mediaId.trim()) return;
         setActiveSearch({ ...search });
      },
      [search],
   );

   const handleFormChange = useCallback((field: keyof SourceFormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
   }, []);

   const handleOpenCreate = useCallback(() => {
      setForm(INITIAL_FORM);
      setIsCreateOpen(true);
   }, []);

   const handleOpenEdit = useCallback((source: AdminVideoSource) => {
      setForm(buildFormFromSource(source));
      setEditTarget(source);
   }, []);

   const handleCreate = useCallback(
      (e: FormEvent) => {
         e.preventDefault();
         if (!activeSearch || !form.sourceUrl.trim()) return;

         createMutation.mutate({
            mediaType: activeSearch.mediaType,
            mediaId: Number(activeSearch.mediaId),
            season: activeSearch.season ? Number(activeSearch.season) : undefined,
            episode: activeSearch.episode ? Number(activeSearch.episode) : undefined,
            sourceType: form.sourceType,
            sourceUrl: form.sourceUrl.trim(),
            label: form.label || undefined,
            quality: form.quality || undefined,
            language: form.language || undefined,
            priority: form.priority ? Number(form.priority) : undefined,
         });
      },
      [activeSearch, form, createMutation],
   );

   const handleUpdate = useCallback(
      (e: FormEvent) => {
         e.preventDefault();
         if (!editTarget || !form.sourceUrl.trim()) return;

         updateMutation.mutate({
            id: editTarget.id,
            data: {
               sourceType: form.sourceType,
               sourceUrl: form.sourceUrl.trim(),
               label: form.label || undefined,
               quality: form.quality || undefined,
               language: form.language || undefined,
               priority: form.priority ? Number(form.priority) : undefined,
            },
         });
      },
      [editTarget, form, updateMutation],
   );

   const handleToggleActive = useCallback(
      (source: AdminVideoSource) => {
         updateMutation.mutate({
            id: source.id,
            data: { isActive: !source.isActive },
         });
      },
      [updateMutation],
   );

   // ─── Render ────────────────────────────────────────────────

   return (
      <div className="space-y-6">
         <AdminPageHeader
            title="Quản lý nguồn phát"
            description="Thêm, sửa, xóa nguồn phát video cho phim lẻ và phim bộ."
            icon={<PlayCircle className="size-6" />}
         />

         {/* Search Form */}
         <form
            onSubmit={handleSearch}
            className="space-y-4 rounded-lg border border-border bg-card p-4"
         >
            {/* Row 1: media type + search/selected media */}
            <div className="flex flex-wrap items-start gap-3">
               <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Loại</span>
                  <Select value={search.mediaType} onValueChange={handleMediaTypeChange}>
                     <SelectTrigger className="w-32">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="movie">
                           <span className="flex items-center gap-1.5">
                              <Film className="size-3.5" /> Phim lẻ
                           </span>
                        </SelectItem>
                        <SelectItem value="tv">
                           <span className="flex items-center gap-1.5">
                              <Tv className="size-3.5" /> Phim bộ
                           </span>
                        </SelectItem>
                     </SelectContent>
                  </Select>
               </div>

               {/* Media picker — search input or selected card */}
               <div className="min-w-0 flex-1 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Chọn phim</span>
                  {selectedMedia ? (
                     <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
                        <SearchResultPoster
                           posterPath={selectedMedia.item.posterPath}
                           alt={
                              selectedMedia.type === 'movie'
                                 ? selectedMedia.item.title
                                 : selectedMedia.item.name
                           }
                        />
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
                           className="shrink-0"
                           onClick={handleClearMedia}
                        >
                           <X className="size-3.5" />
                           <span className="sr-only">Đổi phim</span>
                        </Button>
                     </div>
                  ) : (
                     <div className="relative">
                        <div className="relative">
                           <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                           <Input
                              placeholder={
                                 search.mediaType === 'movie'
                                    ? 'Tìm theo tên phim: Fight Club, Inception...'
                                    : 'Tìm theo tên phim bộ: Breaking Bad...'
                              }
                              value={titleSearch}
                              onChange={(e) => setTitleSearch(e.target.value)}
                              className="pl-8"
                           />
                        </div>
                        {debouncedTitleSearch.length >= 2 && (
                           <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
                              {isSearchingTitle ? (
                                 <div className="flex items-center justify-center py-4">
                                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                 </div>
                              ) : titleSearchResults && titleSearchResults.length > 0 ? (
                                 <div className="max-h-64 overflow-y-auto">
                                    {search.mediaType === 'movie'
                                       ? (titleSearchResults as TmdbMovieSearchResult[]).map(
                                            (item) => (
                                               <button
                                                  key={item.id}
                                                  type="button"
                                                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent"
                                                  onClick={() => handleSelectMovie(item)}
                                               >
                                                  <SearchResultPoster
                                                     posterPath={item.posterPath}
                                                     alt={item.title}
                                                  />
                                                  <div className="min-w-0 flex-1">
                                                     <p className="truncate text-sm font-medium">
                                                        {item.title}
                                                     </p>
                                                     <p className="text-xs text-muted-foreground">
                                                        ID: {item.id}
                                                        {item.releaseDate
                                                           ? ` • ${item.releaseDate.slice(0, 4)}`
                                                           : ''}
                                                     </p>
                                                  </div>
                                               </button>
                                            ),
                                         )
                                       : (titleSearchResults as TmdbTvSearchResult[]).map(
                                            (item) => (
                                               <button
                                                  key={item.id}
                                                  type="button"
                                                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent"
                                                  onClick={() => handleSelectTv(item)}
                                               >
                                                  <SearchResultPoster
                                                     posterPath={item.posterPath}
                                                     alt={item.name}
                                                  />
                                                  <div className="min-w-0 flex-1">
                                                     <p className="truncate text-sm font-medium">
                                                        {item.name}
                                                     </p>
                                                     <p className="text-xs text-muted-foreground">
                                                        ID: {item.id}
                                                        {item.firstAirDate
                                                           ? ` • ${item.firstAirDate.slice(0, 4)}`
                                                           : ''}
                                                     </p>
                                                  </div>
                                               </button>
                                            ),
                                         )}
                                 </div>
                              ) : (
                                 <p className="py-4 text-center text-sm text-muted-foreground">
                                    Không tìm thấy kết quả
                                 </p>
                              )}
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </div>

            {/* Season & Episode picker (TV only) */}
            {search.mediaType === 'tv' && (
               <div className="space-y-3 rounded-md border border-border bg-muted/30 p-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                     Chọn mùa &amp; tập
                  </h3>

                  {!selectedMedia ? (
                     <p className="text-sm text-muted-foreground">Hãy chọn phim bộ ở trên trước.</p>
                  ) : isLoadingTvDetail || isLoadingTmdbSeasons ? (
                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Đang tải danh sách mùa…
                     </div>
                  ) : tvSeasons.length === 0 ? (
                     <div className="flex items-center gap-3">
                        <p className="text-sm text-muted-foreground">
                           Không tìm thấy mùa nào cho phim này.
                        </p>
                        <Button
                           type="button"
                           size="sm"
                           variant="outline"
                           onClick={handleOpenSeasonDialog}
                        >
                           <Plus className="mr-1.5 size-3.5" />
                           Tạo mùa nhanh
                        </Button>
                     </div>
                  ) : (
                     <>
                        {/* Season Select */}
                        <div className="space-y-1">
                           <span className="text-xs font-medium text-muted-foreground">Mùa</span>
                           <div className="flex items-center gap-2">
                              <Select value={search.season} onValueChange={handleSeasonChange}>
                                 <SelectTrigger className="w-64">
                                    <SelectValue placeholder="Chọn mùa…" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    {tvSeasons.map((s) => (
                                       <SelectItem key={s.id} value={String(s.seasonNumber)}>
                                          Mùa {s.seasonNumber} — {s.name}
                                          <span className="ml-1 text-xs text-muted-foreground">
                                             ({s.episodeCount} tập)
                                          </span>
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                              <Button
                                 type="button"
                                 variant="outline"
                                 size="sm"
                                 className="h-9 px-2"
                                 onClick={handleOpenSeasonDialog}
                                 title="Tạo mùa mới"
                              >
                                 <Plus className="size-4" />
                              </Button>
                           </div>
                        </div>

                        {/* Episode grid */}
                        {selectedSeasonInfo && (
                           <div className="space-y-1.5">
                              <span className="text-xs font-medium text-muted-foreground">
                                 Tập ({selectedSeasonInfo.episodeCount} tập)
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                 {episodeOptions.map((ep) => (
                                    <Button
                                       key={ep}
                                       type="button"
                                       variant={
                                          Number(search.episode) === ep ? 'default' : 'outline'
                                       }
                                       size="sm"
                                       className="h-8 w-10 text-xs"
                                       onClick={() => handleEpisodeSelect(ep)}
                                    >
                                       {ep}
                                    </Button>
                                 ))}
                              </div>
                           </div>
                        )}

                        {/* Selection summary */}
                        {search.season && search.episode && (
                           <p className="text-xs text-muted-foreground">
                              Đang tìm nguồn phát cho:{' '}
                              <span className="font-medium text-foreground">
                                 Mùa {search.season}, Tập {search.episode}
                              </span>
                           </p>
                        )}
                     </>
                  )}
               </div>
            )}

            {/* Submit */}
            <div className="flex items-center gap-2">
               <Button type="submit" size="sm" disabled={!search.mediaId.trim()}>
                  <Search className="mr-1.5 size-3.5" />
                  Tìm nguồn phát
               </Button>
               {!selectedMedia && !titleSearch && (
                  <p className="text-xs text-muted-foreground">
                     Gõ tên phim để tìm kiếm, hoặc nhập TMDB ID trực tiếp
                  </p>
               )}
            </div>
         </form>

         {/* Results */}
         {activeSearch && (
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Video className="size-5 text-primary" />
                     <h2 className="text-lg font-semibold">
                        {selectedMedia != null ? (
                           selectedMedia.type === 'movie' ? (
                              selectedMedia.item.title
                           ) : (
                              selectedMedia.item.name
                           )
                        ) : (
                           <>
                              {activeSearch.mediaType === 'movie' ? 'Phim lẻ' : 'Phim bộ'} #
                              {activeSearch.mediaId}
                           </>
                        )}
                        {activeSearch.mediaType === 'tv' && activeSearch.season && (
                           <span className="font-normal text-muted-foreground">
                              {' '}
                              — Mùa {activeSearch.season}
                              {activeSearch.episode && `, Tập ${activeSearch.episode}`}
                           </span>
                        )}
                     </h2>
                     <Badge variant="secondary">{data?.total ?? 0} nguồn</Badge>
                  </div>
                  <Button size="sm" onClick={handleOpenCreate}>
                     <Plus className="mr-1.5 size-3.5" />
                     Thêm nguồn
                  </Button>
               </div>

               {isLoading ? (
                  <div className="flex min-h-[20vh] items-center justify-center">
                     <Loader2 className="size-6 animate-spin text-primary" />
                  </div>
               ) : data?.sources.length === 0 ? (
                  <div className="flex min-h-[20vh] flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card text-muted-foreground">
                     <PlayCircle className="size-10" />
                     <p>Chưa có nguồn phát nào.</p>
                  </div>
               ) : (
                  <div className="overflow-x-auto rounded-lg border border-border">
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead className="w-16">Loại</TableHead>
                              <TableHead>URL</TableHead>
                              <TableHead className="w-28">Nhãn</TableHead>
                              <TableHead className="w-20">Chất lượng</TableHead>
                              <TableHead className="w-20">Ngôn ngữ</TableHead>
                              <TableHead className="w-16">Ưu tiên</TableHead>
                              <TableHead className="w-20">Trạng thái</TableHead>
                              <TableHead className="w-24 text-right">Thao tác</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {data?.sources.map((source) => (
                              <TableRow key={source.id}>
                                 <TableCell>
                                    <Badge variant="outline" className="text-xs">
                                       <SourceTypeIcon type={source.sourceType} />
                                       {source.sourceType}
                                    </Badge>
                                 </TableCell>
                                 <TableCell className="max-w-xs truncate font-mono text-xs">
                                    {source.sourceUrl}
                                 </TableCell>
                                 <TableCell>{source.label || '—'}</TableCell>
                                 <TableCell>{source.quality || '—'}</TableCell>
                                 <TableCell>{source.language || '—'}</TableCell>
                                 <TableCell className="text-center">{source.priority}</TableCell>
                                 <TableCell>
                                    <Button
                                       variant={source.isActive ? 'default' : 'outline'}
                                       size="sm"
                                       className="h-6 text-xs"
                                       onClick={() => handleToggleActive(source)}
                                    >
                                       {source.isActive ? 'Bật' : 'Tắt'}
                                    </Button>
                                 </TableCell>
                                 <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                       <Button
                                          variant="ghost"
                                          size="sm"
                                          className="size-7 p-0"
                                          onClick={() => handleOpenEdit(source)}
                                       >
                                          <Edit className="size-3.5" />
                                          <span className="sr-only">Sửa</span>
                                       </Button>
                                       <Button
                                          variant="ghost"
                                          size="sm"
                                          className="size-7 p-0 text-destructive hover:text-destructive"
                                          onClick={() => setDeleteTarget(source)}
                                       >
                                          <Trash2 className="size-3.5" />
                                          <span className="sr-only">Xóa</span>
                                       </Button>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </div>
               )}
            </div>
         )}

         {/* Create Dialog */}
         <SourceFormDialog
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={handleCreate}
            form={form}
            onChange={handleFormChange}
            isPending={createMutation.isPending}
            title="Thêm nguồn phát"
            description="Thêm một nguồn phát mới cho nội dung này."
            submitLabel="Thêm"
         />

         {/* Edit Dialog */}
         <SourceFormDialog
            isOpen={!!editTarget}
            onClose={() => setEditTarget(null)}
            onSubmit={handleUpdate}
            form={form}
            onChange={handleFormChange}
            isPending={updateMutation.isPending}
            title="Sửa nguồn phát"
            description="Cập nhật thông tin nguồn phát."
            submitLabel="Lưu"
         />

         {/* Delete Dialog */}
         <ConfirmDialog
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            title="Xóa nguồn phát"
            description={`Xác nhận xóa nguồn "${deleteTarget?.label || deleteTarget?.sourceUrl}"? Hành động này không thể hoàn tác.`}
            isLoading={deleteMutation.isPending}
         />

         {/* Create Season Dialog */}
         <Dialog
            open={isSeasonDialogOpen}
            onOpenChange={(open) => !open && setIsSeasonDialogOpen(false)}
         >
            <DialogContent className="sm:max-w-sm">
               <DialogHeader>
                  <DialogTitle>Tạo mùa mới</DialogTitle>
                  <DialogDescription>Thêm mùa mới cho phim bộ đã chọn.</DialogDescription>
               </DialogHeader>
               <form onSubmit={handleCreateSeason} className="space-y-4">
                  <div className="space-y-1">
                     <span className="text-sm font-medium">Tên mùa</span>
                     <Input
                        value={seasonForm.name}
                        onChange={(e) =>
                           setSeasonForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="VD: Season 1"
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                        <span className="text-sm font-medium">Số mùa</span>
                        <Input
                           type="number"
                           min={1}
                           value={seasonForm.seasonNumber}
                           onChange={(e) =>
                              setSeasonForm((prev) => ({
                                 ...prev,
                                 seasonNumber: e.target.value,
                              }))
                           }
                        />
                     </div>
                     <div className="space-y-1">
                        <span className="text-sm font-medium">Số tập</span>
                        <Input
                           type="number"
                           min={0}
                           value={seasonForm.episodeCount}
                           onChange={(e) =>
                              setSeasonForm((prev) => ({
                                 ...prev,
                                 episodeCount: e.target.value,
                              }))
                           }
                        />
                     </div>
                  </div>
                  <DialogFooter>
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsSeasonDialogOpen(false)}
                     >
                        Hủy
                     </Button>
                     <Button type="submit" disabled={createSeasonMutation.isPending}>
                        {createSeasonMutation.isPending && (
                           <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        )}
                        Tạo mùa
                     </Button>
                  </DialogFooter>
               </form>
            </DialogContent>
         </Dialog>
      </div>
   );
}

// ─── Search result poster ────────────────────────────────────

function SearchResultPoster({
   posterPath,
   alt,
}: {
   readonly posterPath: string | null;
   readonly alt: string;
}) {
   if (posterPath) {
      return (
         <Image
            src={`${IMAGE_SIZES.poster.small}${posterPath}`}
            alt={alt}
            width={28}
            height={42}
            className="shrink-0 rounded object-cover"
            style={{ height: 'auto' }}
         />
      );
   }
   return (
      <div className="flex h-[42px] w-7 shrink-0 items-center justify-center rounded bg-muted">
         <Film className="size-4 text-muted-foreground" />
      </div>
   );
}

// ─── Shared form dialog ─────────────────────────────────────

interface SourceFormDialogProps {
   readonly isOpen: boolean;
   readonly onClose: () => void;
   readonly onSubmit: (e: FormEvent) => void;
   readonly form: SourceFormState;
   readonly onChange: (field: keyof SourceFormState, value: string) => void;
   readonly isPending: boolean;
   readonly title: string;
   readonly description: string;
   readonly submitLabel: string;
}

function SourceFormDialog({
   isOpen,
   onClose,
   onSubmit,
   form,
   onChange,
   isPending,
   title,
   description,
   submitLabel,
}: SourceFormDialogProps) {
   return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
         <DialogContent className="sm:max-w-md">
            <DialogHeader>
               <DialogTitle>{title}</DialogTitle>
               <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
               <div className="space-y-1">
                  <span className="text-sm font-medium">Loại nguồn</span>
                  <Select value={form.sourceType} onValueChange={(v) => onChange('sourceType', v)}>
                     <SelectTrigger>
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="hls">{SOURCE_TYPE_LABELS.hls}</SelectItem>
                        <SelectItem value="embed">{SOURCE_TYPE_LABELS.embed}</SelectItem>
                        <SelectItem value="direct">{SOURCE_TYPE_LABELS.direct}</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
               <div className="space-y-1">
                  <span className="text-sm font-medium">URL nguồn</span>
                  <Input
                     type="url"
                     placeholder={
                        form.sourceType === 'hls'
                           ? 'https://cdn.example.com/video/master.m3u8'
                           : form.sourceType === 'embed'
                             ? 'https://embed.example.com/video/12345'
                             : 'https://cdn.example.com/video.mp4'
                     }
                     value={form.sourceUrl}
                     onChange={(e) => onChange('sourceUrl', e.target.value)}
                     required
                  />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                     <span className="text-sm font-medium">Nhãn</span>
                     <Input
                        placeholder="VD: Server 1"
                        value={form.label}
                        onChange={(e) => onChange('label', e.target.value)}
                     />
                  </div>
                  <div className="space-y-1">
                     <span className="text-sm font-medium">Chất lượng</span>
                     <Input
                        placeholder="VD: 1080p"
                        value={form.quality}
                        onChange={(e) => onChange('quality', e.target.value)}
                     />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                     <span className="text-sm font-medium">Ngôn ngữ</span>
                     <Input
                        placeholder="VD: Vietsub"
                        value={form.language}
                        onChange={(e) => onChange('language', e.target.value)}
                     />
                  </div>
                  <div className="space-y-1">
                     <span className="text-sm font-medium">Ưu tiên</span>
                     <Input
                        type="number"
                        placeholder="0"
                        value={form.priority}
                        onChange={(e) => onChange('priority', e.target.value)}
                        min={0}
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                     Hủy
                  </Button>
                  <Button type="submit" disabled={isPending || !form.sourceUrl.trim()}>
                     {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                     {submitLabel}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
