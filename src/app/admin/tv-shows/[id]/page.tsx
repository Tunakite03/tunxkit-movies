'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
   Tv,
   ArrowLeft,
   Save,
   Trash2,
   ExternalLink,
   PlayCircle,
   Users,
   Star,
   Calendar,
   Layers,
   Loader2,
   MonitorPlay,
   Pencil,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import {
   getAdminTVShowDetail,
   updateAdminTVShow,
   deleteAdminTVVideo,
   createAdminTVShowVideo,
   addAdminTVShowCast,
   removeAdminTVShowCast,
   createAdminTVSeason,
   updateAdminTVSeason,
   deleteAdminTVSeason,
} from '@/services/admin-dashboard-service';
import type {
   UpdateTVShowData,
   CreateVideoData,
   AddCastData,
   CreateTVSeasonData,
   UpdateTVSeasonData,
   AdminSeasonItem,
} from '@/services/admin-dashboard-service';
import { useAuthStore } from '@/store/auth-store';
import { IMAGE_SIZES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { CreateVideoDialog } from '@/components/admin/create-video-dialog';
import { AddCastDialog } from '@/components/admin/add-cast-dialog';
import { VideoSourcesTab } from '@/components/admin/video-sources-tab';
import { CreateSeasonDialog, EditSeasonDialog } from '@/components/admin/season-dialog';

/** TV show edit form fields */
interface TVShowFormState {
   name: string;
   overview: string;
   tagline: string;
   status: string;
   firstAirDate: string;
   voteAverage: string;
   numberOfSeasons: string;
   numberOfEpisodes: string;
}

function buildInitialForm(data: {
   name: string;
   overview: string;
   tagline: string;
   status: string;
   firstAirDate: string;
   voteAverage: number;
   numberOfSeasons: number;
   numberOfEpisodes: number;
}): TVShowFormState {
   return {
      name: data.name,
      overview: data.overview,
      tagline: data.tagline,
      status: data.status,
      firstAirDate: data.firstAirDate,
      voteAverage: String(data.voteAverage),
      numberOfSeasons: String(data.numberOfSeasons),
      numberOfEpisodes: String(data.numberOfEpisodes),
   };
}

function buildUpdatePayload(form: TVShowFormState): UpdateTVShowData {
   return {
      name: form.name || undefined,
      overview: form.overview,
      tagline: form.tagline,
      status: form.status || undefined,
      firstAirDate: form.firstAirDate,
      voteAverage: form.voteAverage ? Number(form.voteAverage) : undefined,
      numberOfSeasons: form.numberOfSeasons ? Number(form.numberOfSeasons) : undefined,
      numberOfEpisodes: form.numberOfEpisodes ? Number(form.numberOfEpisodes) : undefined,
   };
}

export default function AdminTVShowDetailPage() {
   const params = useParams();
   const router = useRouter();
   const tvShowId = Number(params.id);
   const { token } = useAuthStore();
   const queryClient = useQueryClient();

   const [form, setForm] = useState<TVShowFormState | null>(null);
   const [deleteVideoTarget, setDeleteVideoTarget] = useState<{
      id: string;
      name: string;
   } | null>(null);
   const [deleteCastTarget, setDeleteCastTarget] = useState<{
      id: string;
      name: string;
   } | null>(null);
   const [editSeasonTarget, setEditSeasonTarget] = useState<AdminSeasonItem | null>(null);
   const [deleteSeasonTarget, setDeleteSeasonTarget] = useState<AdminSeasonItem | null>(null);

   const { data, isLoading } = useQuery({
      queryKey: ['admin-tv-detail', tvShowId],
      queryFn: () => getAdminTVShowDetail(tvShowId, token as string),
      enabled: !!token && !isNaN(tvShowId),
      select: (result) => {
         if (!form) {
            setForm(buildInitialForm(result));
         }
         return result;
      },
   });

   const updateMutation = useMutation({
      mutationFn: (payload: UpdateTVShowData) =>
         updateAdminTVShow(tvShowId, payload, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-tv-detail', tvShowId] });
         queryClient.invalidateQueries({ queryKey: ['admin-tv-shows'] });
      },
   });

   const deleteVideoMutation = useMutation({
      mutationFn: (videoId: string) => deleteAdminTVVideo(videoId, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-tv-detail', tvShowId] });
         setDeleteVideoTarget(null);
      },
   });

   const createVideoMutation = useMutation({
      mutationFn: (videoData: CreateVideoData) =>
         createAdminTVShowVideo(tvShowId, videoData, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-tv-detail', tvShowId] });
      },
   });

   const addCastMutation = useMutation({
      mutationFn: (castData: AddCastData) =>
         addAdminTVShowCast(tvShowId, castData, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-tv-detail', tvShowId] });
         queryClient.invalidateQueries({ queryKey: ['admin-tv-shows'] });
      },
   });

   const removeCastMutation = useMutation({
      mutationFn: (castId: string) => removeAdminTVShowCast(castId, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-tv-detail', tvShowId] });
         queryClient.invalidateQueries({ queryKey: ['admin-tv-shows'] });
         setDeleteCastTarget(null);
      },
   });

   const createSeasonMutation = useMutation({
      mutationFn: (data: CreateTVSeasonData) =>
         createAdminTVSeason(tvShowId, data, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-tv-detail', tvShowId] });
         queryClient.invalidateQueries({ queryKey: ['admin-tv-shows'] });
      },
   });

   const updateSeasonMutation = useMutation({
      mutationFn: ({ seasonId, data }: { seasonId: number; data: UpdateTVSeasonData }) =>
         updateAdminTVSeason(tvShowId, seasonId, data, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-tv-detail', tvShowId] });
         queryClient.invalidateQueries({ queryKey: ['admin-tv-shows'] });
         setEditSeasonTarget(null);
      },
   });

   const deleteSeasonMutation = useMutation({
      mutationFn: (seasonId: number) => deleteAdminTVSeason(tvShowId, seasonId, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-tv-detail', tvShowId] });
         queryClient.invalidateQueries({ queryKey: ['admin-tv-shows'] });
         setDeleteSeasonTarget(null);
      },
   });

   const handleFormChange = useCallback((field: keyof TVShowFormState, value: string) => {
      setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
   }, []);

   const handleSave = useCallback(() => {
      if (!form) return;
      updateMutation.mutate(buildUpdatePayload(form));
   }, [form, updateMutation]);

   if (isLoading) {
      return (
         <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
      );
   }

   if (!data) {
      return (
         <div className="space-y-4">
            <Button variant="ghost" onClick={() => router.back()}>
               <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
            <p className="text-center text-muted-foreground">Không tìm thấy phim bộ</p>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <AdminPageHeader
            title={data.name}
            description={`ID: ${data.id} · ${data.firstAirDate || 'Chưa có ngày'}`}
            icon={<Tv className="h-6 w-6 text-purple-500" />}
            actions={
               <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.back()}>
                     <ArrowLeft className="mr-1 h-3 w-3" /> Quay lại
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                     <Link href={`/tv/${data.id}`} target="_blank">
                        <ExternalLink className="mr-1 h-3 w-3" /> Xem trang
                     </Link>
                  </Button>
               </div>
            }
         />

         {/* TV Show Header Card */}
         <div className="flex gap-4 rounded-lg border border-border bg-card p-4">
            {data.posterPath ? (
               <Image
                  src={`${IMAGE_SIZES.poster.medium}${data.posterPath}`}
                  alt={data.name}
                  width={120}
                  height={180}
                  className="rounded-lg object-cover"
               />
            ) : (
               <div className="flex h-[180px] w-[120px] items-center justify-center rounded-lg bg-muted">
                  <Tv className="h-8 w-8 text-muted-foreground" />
               </div>
            )}
            <div className="flex flex-1 flex-col gap-2">
               <div className="flex flex-wrap items-center gap-2">
                  {data.genres.map((g) => (
                     <Badge key={g.genre.id} variant="secondary">
                        {g.genre.name}
                     </Badge>
                  ))}
               </div>
               <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                     <Star className="h-3 w-3 text-amber-500" /> {data.voteAverage.toFixed(1)} (
                     {data.voteCount} votes)
                  </span>
                  <span className="flex items-center gap-1">
                     <Calendar className="h-3 w-3" /> {data.firstAirDate || '—'}
                     {data.lastAirDate ? ` → ${data.lastAirDate}` : ''}
                  </span>
                  <span className="flex items-center gap-1">
                     <Layers className="h-3 w-3" /> {data.numberOfSeasons} seasons ·{' '}
                     {data.numberOfEpisodes} episodes
                  </span>
                  <Badge variant="outline">{data.status}</Badge>
               </div>
               {data.tagline && (
                  <p className="text-sm italic text-muted-foreground">&quot;{data.tagline}&quot;</p>
               )}
               <p className="line-clamp-3 text-sm text-muted-foreground">{data.overview}</p>
            </div>
         </div>

         {/* Tabs */}
         <Tabs defaultValue="edit">
            <TabsList>
               <TabsTrigger value="edit">
                  <Save className="mr-1 h-3 w-3" /> Chỉnh sửa
               </TabsTrigger>
               <TabsTrigger value="cast">
                  <Users className="mr-1 h-3 w-3" /> Diễn viên ({data.cast.length})
               </TabsTrigger>
               <TabsTrigger value="seasons">
                  <Layers className="mr-1 h-3 w-3" /> Seasons ({data.seasons.length})
               </TabsTrigger>
               <TabsTrigger value="videos">
                  <PlayCircle className="mr-1 h-3 w-3" /> Videos ({data.videos.length})
               </TabsTrigger>
               <TabsTrigger value="sources">
                  <MonitorPlay className="mr-1 h-3 w-3" /> Nguồn phát
               </TabsTrigger>
            </TabsList>

            {/* Edit Tab */}
            <TabsContent value="edit" className="space-y-4">
               {form && (
                  <div className="rounded-lg border border-border bg-card p-4">
                     <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-foreground">Tên phim</label>
                           <Input
                              value={form.name}
                              onChange={(e) => handleFormChange('name', e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-foreground">
                              Ngày phát sóng
                           </label>
                           <Input
                              value={form.firstAirDate}
                              onChange={(e) => handleFormChange('firstAirDate', e.target.value)}
                              placeholder="YYYY-MM-DD"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-foreground">Trạng thái</label>
                           <Input
                              value={form.status}
                              onChange={(e) => handleFormChange('status', e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-foreground">
                              Đánh giá (0-10)
                           </label>
                           <Input
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              value={form.voteAverage}
                              onChange={(e) => handleFormChange('voteAverage', e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-foreground">Số mùa</label>
                           <Input
                              type="number"
                              min={0}
                              value={form.numberOfSeasons}
                              onChange={(e) => handleFormChange('numberOfSeasons', e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-foreground">Số tập</label>
                           <Input
                              type="number"
                              min={0}
                              value={form.numberOfEpisodes}
                              onChange={(e) => handleFormChange('numberOfEpisodes', e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-foreground">Tagline</label>
                           <Input
                              value={form.tagline}
                              onChange={(e) => handleFormChange('tagline', e.target.value)}
                           />
                        </div>
                        <div className="col-span-full space-y-2">
                           <label className="text-sm font-medium text-foreground">Mô tả</label>
                           <textarea
                              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              value={form.overview}
                              onChange={(e) => handleFormChange('overview', e.target.value)}
                           />
                        </div>
                     </div>
                     <div className="mt-4 flex justify-end">
                        <Button onClick={handleSave} disabled={updateMutation.isPending}>
                           {updateMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           ) : (
                              <Save className="mr-2 h-4 w-4" />
                           )}
                           Lưu thay đổi
                        </Button>
                     </div>
                     {updateMutation.isSuccess && (
                        <p className="mt-2 text-sm text-green-500">Cập nhật thành công!</p>
                     )}
                     {updateMutation.isError && (
                        <p className="mt-2 text-sm text-destructive">
                           Lỗi cập nhật. Vui lòng thử lại.
                        </p>
                     )}
                  </div>
               )}
            </TabsContent>

            {/* Cast Tab */}
            <TabsContent value="cast">
               <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{data.cast.length} diễn viên</p>
                  <AddCastDialog
                     mediaTitle={data.name}
                     mediaType="tv"
                     onSubmit={(castData) => addCastMutation.mutate(castData)}
                     isPending={addCastMutation.isPending}
                     isSuccess={addCastMutation.isSuccess}
                  />
               </div>
               <div className="rounded-lg border border-border bg-card">
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead className="w-12">#</TableHead>
                           <TableHead className="w-16">Ảnh</TableHead>
                           <TableHead>Tên diễn viên</TableHead>
                           <TableHead>Vai diễn</TableHead>
                           <TableHead className="w-24 text-right">Thao tác</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {data.cast.length > 0 ? (
                           data.cast.map((c, i) => (
                              <TableRow key={c.id}>
                                 <TableCell className="text-xs text-muted-foreground">
                                    {i + 1}
                                 </TableCell>
                                 <TableCell>
                                    {c.person.profilePath ? (
                                       <Image
                                          src={`${IMAGE_SIZES.profile.small}${c.person.profilePath}`}
                                          alt={c.person.name}
                                          width={32}
                                          height={48}
                                          className="rounded object-cover"
                                          style={{ height: 'auto' }}
                                       />
                                    ) : (
                                       <div className="flex h-12 w-8 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                                          N/A
                                       </div>
                                    )}
                                 </TableCell>
                                 <TableCell className="font-medium">{c.person.name}</TableCell>
                                 <TableCell className="text-muted-foreground">
                                    {c.character || '—'}
                                 </TableCell>
                                 <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                       <Button variant="ghost" size="icon-xs" asChild>
                                          <Link href={`/people/${c.person.id}`} target="_blank">
                                             <ExternalLink className="h-3 w-3" />
                                          </Link>
                                       </Button>
                                       <Button
                                          variant="ghost"
                                          size="icon-xs"
                                          onClick={() =>
                                             setDeleteCastTarget({
                                                id: c.id,
                                                name: c.person.name,
                                             })
                                          }
                                          className="text-destructive hover:text-destructive"
                                       >
                                          <Trash2 className="h-3 w-3" />
                                       </Button>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ))
                        ) : (
                           <TableRow>
                              <TableCell
                                 colSpan={5}
                                 className="py-8 text-center text-muted-foreground"
                              >
                                 Chưa có diễn viên nào
                              </TableCell>
                           </TableRow>
                        )}
                     </TableBody>
                  </Table>
               </div>
            </TabsContent>

            {/* Seasons Tab */}
            <TabsContent value="seasons">
               <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{data.seasons.length} mùa</p>
                  <CreateSeasonDialog
                     mediaTitle={data.name}
                     onSubmit={(seasonData) => createSeasonMutation.mutate(seasonData)}
                     isPending={createSeasonMutation.isPending}
                     isSuccess={createSeasonMutation.isSuccess}
                  />
               </div>
               <div className="rounded-lg border border-border bg-card">
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead className="w-16">Mùa</TableHead>
                           <TableHead>Tên</TableHead>
                           <TableHead className="hidden sm:table-cell">Số tập</TableHead>
                           <TableHead className="hidden md:table-cell">Ngày phát sóng</TableHead>
                           <TableHead className="w-24 text-right">Thao tác</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {data.seasons.length > 0 ? (
                           data.seasons.map((s) => (
                              <TableRow key={s.id}>
                                 <TableCell className="font-mono text-xs text-muted-foreground">
                                    S{String(s.seasonNumber).padStart(2, '0')}
                                 </TableCell>
                                 <TableCell className="font-medium">{s.name}</TableCell>
                                 <TableCell className="hidden text-muted-foreground sm:table-cell">
                                    {s.episodeCount} tập
                                 </TableCell>
                                 <TableCell className="hidden text-muted-foreground md:table-cell">
                                    {s.airDate || '—'}
                                 </TableCell>
                                 <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                       <Button
                                          variant="ghost"
                                          size="icon-xs"
                                          onClick={() => setEditSeasonTarget(s)}
                                       >
                                          <Pencil className="h-3 w-3" />
                                       </Button>
                                       <Button
                                          variant="ghost"
                                          size="icon-xs"
                                          onClick={() => setDeleteSeasonTarget(s)}
                                          className="text-destructive hover:text-destructive"
                                       >
                                          <Trash2 className="h-3 w-3" />
                                       </Button>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ))
                        ) : (
                           <TableRow>
                              <TableCell
                                 colSpan={5}
                                 className="py-8 text-center text-muted-foreground"
                              >
                                 Chưa có thông tin mùa
                              </TableCell>
                           </TableRow>
                        )}
                     </TableBody>
                  </Table>
               </div>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos">
               <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                     {data.videos.length} video{data.videos.length !== 1 ? 's' : ''}
                  </p>
                  <CreateVideoDialog
                     mediaTitle={data.name}
                     onSubmit={(videoData) => createVideoMutation.mutate(videoData)}
                     isPending={createVideoMutation.isPending}
                     isSuccess={createVideoMutation.isSuccess}
                  />
               </div>
               <div className="rounded-lg border border-border bg-card">
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Tên</TableHead>
                           <TableHead className="hidden sm:table-cell">Loại</TableHead>
                           <TableHead className="hidden md:table-cell">Nguồn</TableHead>
                           <TableHead className="hidden md:table-cell">Chính thức</TableHead>
                           <TableHead className="w-24 text-right">Thao tác</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {data.videos.length > 0 ? (
                           data.videos.map((v) => (
                              <TableRow key={v.id}>
                                 <TableCell className="max-w-[200px] truncate font-medium">
                                    {v.name}
                                 </TableCell>
                                 <TableCell className="hidden sm:table-cell">
                                    <Badge variant="outline">{v.type}</Badge>
                                 </TableCell>
                                 <TableCell className="hidden text-muted-foreground md:table-cell">
                                    {v.site}
                                 </TableCell>
                                 <TableCell className="hidden md:table-cell">
                                    <Badge variant={v.official ? 'default' : 'secondary'}>
                                       {v.official ? 'Yes' : 'No'}
                                    </Badge>
                                 </TableCell>
                                 <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                       {v.site === 'YouTube' && (
                                          <Button variant="ghost" size="icon-xs" asChild>
                                             <a
                                                href={`https://www.youtube.com/watch?v=${v.key}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                             >
                                                <PlayCircle className="h-3 w-3" />
                                             </a>
                                          </Button>
                                       )}
                                       <Button
                                          variant="ghost"
                                          size="icon-xs"
                                          onClick={() =>
                                             setDeleteVideoTarget({ id: v.id, name: v.name })
                                          }
                                          className="text-destructive hover:text-destructive"
                                       >
                                          <Trash2 className="h-3 w-3" />
                                       </Button>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ))
                        ) : (
                           <TableRow>
                              <TableCell
                                 colSpan={5}
                                 className="py-8 text-center text-muted-foreground"
                              >
                                 Chưa có video nào
                              </TableCell>
                           </TableRow>
                        )}
                     </TableBody>
                  </Table>
               </div>
            </TabsContent>

            {/* Video Sources Tab */}
            <TabsContent value="sources">
               <VideoSourcesTab
                  mediaType="tv"
                  mediaId={data.id}
                  mediaTitle={data.name}
                  seasons={data.seasons.map((s) => ({
                     seasonNumber: s.seasonNumber,
                     name: s.name,
                     episodeCount: s.episodeCount,
                  }))}
               />
            </TabsContent>
         </Tabs>

         {/* Delete Video Confirm */}
         <ConfirmDialog
            isOpen={!!deleteVideoTarget}
            onClose={() => setDeleteVideoTarget(null)}
            onConfirm={() => deleteVideoTarget && deleteVideoMutation.mutate(deleteVideoTarget.id)}
            title="Xóa video"
            description={`Bạn có chắc muốn xóa video "${deleteVideoTarget?.name}"? Hành động này không thể hoàn tác.`}
            isLoading={deleteVideoMutation.isPending}
         />

         {/* Delete Cast Confirm */}
         <ConfirmDialog
            isOpen={!!deleteCastTarget}
            onClose={() => setDeleteCastTarget(null)}
            onConfirm={() => deleteCastTarget && removeCastMutation.mutate(deleteCastTarget.id)}
            title="Xóa diễn viên"
            description={`Bạn có chắc muốn xóa "${deleteCastTarget?.name}" khỏi danh sách diễn viên? Hành động này không thể hoàn tác.`}
            isLoading={removeCastMutation.isPending}
         />

         {/* Edit Season Dialog */}
         {editSeasonTarget && (
            <EditSeasonDialog
               season={editSeasonTarget}
               isOpen={!!editSeasonTarget}
               onClose={() => setEditSeasonTarget(null)}
               onSubmit={(seasonData) =>
                  updateSeasonMutation.mutate({
                     seasonId: editSeasonTarget.id,
                     data: seasonData,
                  })
               }
               isPending={updateSeasonMutation.isPending}
            />
         )}

         {/* Delete Season Confirm */}
         <ConfirmDialog
            isOpen={!!deleteSeasonTarget}
            onClose={() => setDeleteSeasonTarget(null)}
            onConfirm={() =>
               deleteSeasonTarget && deleteSeasonMutation.mutate(deleteSeasonTarget.id)
            }
            title="Xóa mùa"
            description={`Bạn có chắc muốn xóa "${deleteSeasonTarget?.name}"? Hành động này không thể hoàn tác.`}
            isLoading={deleteSeasonMutation.isPending}
         />
      </div>
   );
}
