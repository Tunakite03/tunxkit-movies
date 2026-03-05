'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Loader2, Play, Globe, Film } from 'lucide-react';

import {
   getAdminVideoSources,
   createAdminVideoSource,
   updateAdminVideoSource,
   deleteAdminVideoSource,
} from '@/services/admin-dashboard-service';
import type {
   AdminVideoSource,
   CreateVideoSourceData,
   UpdateVideoSourceData,
} from '@/services/admin-dashboard-service';
import { useAuthStore } from '@/store/auth-store';
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
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

// ─── Constants ──────────────────────────────────────────────

const SOURCE_TYPE_LABELS = {
   hls: 'HLS (.m3u8)',
   embed: 'Embed (iframe)',
   direct: 'Direct (mp4)',
} as const;

// ─── Source type icon ───────────────────────────────────────

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

// ─── Form state ─────────────────────────────────────────────

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

// ─── Props ──────────────────────────────────────────────────

/** Season info shape for the episode picker */
interface SeasonInfo {
   readonly seasonNumber: number;
   readonly name: string;
   readonly episodeCount: number;
}

interface VideoSourcesTabProps {
   /** 'movie' or 'tv' */
   readonly mediaType: 'movie' | 'tv';
   /** TMDB ID of the movie/TV show */
   readonly mediaId: number;
   /** Display name — used in dialog descriptions */
   readonly mediaTitle: string;
   /** TV show season data — required for TV mediaType to enable episode picker */
   readonly seasons?: readonly SeasonInfo[];
}

/**
 * Reusable tab content for managing video sources (HLS, embed, direct)
 * on the admin movie/TV show detail pages.
 *
 * For TV shows, renders a season/episode picker before the sources table.
 */
export function VideoSourcesTab({
   mediaType,
   mediaId,
   mediaTitle,
   seasons,
}: VideoSourcesTabProps) {
   const { token } = useAuthStore();
   const queryClient = useQueryClient();

   // ─── Season / Episode selection (TV only) ────────────────
   const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
   const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);

   const isTv = mediaType === 'tv' && seasons && seasons.length > 0;
   const currentSeasonInfo = isTv
      ? seasons.find((s) => s.seasonNumber === selectedSeason)
      : null;

   // For movies: no season/episode needed. For TV: use selected values.
   const effectiveSeason = isTv ? selectedSeason ?? undefined : undefined;
   const effectiveEpisode = isTv ? selectedEpisode ?? undefined : undefined;

   // Whether we have enough context to show/manage sources
   const canShowSources =
      mediaType === 'movie' || (selectedSeason != null && selectedEpisode != null);

   // ─── Dialog state ────────────────────────────────────────
   const [isCreateOpen, setIsCreateOpen] = useState(false);
   const [editTarget, setEditTarget] = useState<AdminVideoSource | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<AdminVideoSource | null>(null);
   const [form, setForm] = useState<SourceFormState>(INITIAL_FORM);

   const queryKey = [
      'admin-video-sources',
      mediaType,
      mediaId,
      effectiveSeason,
      effectiveEpisode,
   ];

   const { data, isLoading } = useQuery({
      queryKey,
      queryFn: () =>
         getAdminVideoSources(
            mediaType,
            mediaId,
            token as string,
            effectiveSeason,
            effectiveEpisode,
         ),
      enabled: !!token && canShowSources,
   });

   const createMutation = useMutation({
      mutationFn: (payload: CreateVideoSourceData) =>
         createAdminVideoSource(payload, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey });
         setIsCreateOpen(false);
         setForm(INITIAL_FORM);
      },
   });

   const updateMutation = useMutation({
      mutationFn: ({ id, data: payload }: { id: string; data: UpdateVideoSourceData }) =>
         updateAdminVideoSource(id, payload, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey });
         setEditTarget(null);
         setForm(INITIAL_FORM);
      },
   });

   const deleteMutation = useMutation({
      mutationFn: (id: string) => deleteAdminVideoSource(id, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey });
         setDeleteTarget(null);
      },
   });

   // ─── Handlers ──────────────────────────────────────────────

   const handleSeasonChange = useCallback((value: string) => {
      const season = Number(value);
      setSelectedSeason(season);
      setSelectedEpisode(null); // Reset episode when season changes
   }, []);

   const handleEpisodeSelect = useCallback((ep: number) => {
      setSelectedEpisode(ep);
   }, []);

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
         if (!form.sourceUrl.trim()) return;

         createMutation.mutate({
            mediaType,
            mediaId,
            season: effectiveSeason,
            episode: effectiveEpisode,
            sourceType: form.sourceType,
            sourceUrl: form.sourceUrl.trim(),
            label: form.label || undefined,
            quality: form.quality || undefined,
            language: form.language || undefined,
            priority: form.priority ? Number(form.priority) : undefined,
         });
      },
      [mediaType, mediaId, effectiveSeason, effectiveEpisode, form, createMutation],
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

   const sources = data?.sources ?? [];

   return (
      <div className="space-y-4">
         {/* Season / Episode Picker for TV shows */}
         {isTv && (
            <div className="space-y-3 rounded-lg border border-border bg-card p-4">
               <h3 className="text-sm font-semibold">Chọn mùa & tập</h3>

               {/* Season selector */}
               <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1">
                     <span className="text-xs font-medium text-muted-foreground">Mùa</span>
                     <Select
                        value={selectedSeason != null ? String(selectedSeason) : ''}
                        onValueChange={handleSeasonChange}
                     >
                        <SelectTrigger className="w-48">
                           <SelectValue placeholder="Chọn mùa..." />
                        </SelectTrigger>
                        <SelectContent>
                           {seasons.map((s) => (
                              <SelectItem key={s.seasonNumber} value={String(s.seasonNumber)}>
                                 Mùa {s.seasonNumber} — {s.name} ({s.episodeCount} tập)
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               {/* Episode grid */}
               {currentSeasonInfo && currentSeasonInfo.episodeCount > 0 && (
                  <div className="space-y-1">
                     <span className="text-xs font-medium text-muted-foreground">
                        Tập ({currentSeasonInfo.episodeCount} tập)
                     </span>
                     <div className="flex flex-wrap gap-1.5">
                        {Array.from(
                           { length: currentSeasonInfo.episodeCount },
                           (_, i) => i + 1,
                        ).map((ep) => (
                           <Button
                              key={ep}
                              variant={selectedEpisode === ep ? 'default' : 'outline'}
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

               {/* Current selection summary */}
               {selectedSeason != null && selectedEpisode != null && (
                  <p className="text-xs text-muted-foreground">
                     Đang quản lý nguồn phát cho:{' '}
                     <span className="font-medium text-foreground">
                        Mùa {selectedSeason}, Tập {selectedEpisode}
                     </span>
                  </p>
               )}
            </div>
         )}

         {/* Prompt to select season/episode if TV and not selected yet */}
         {isTv && !canShowSources && (
            <div className="flex min-h-[15vh] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-muted-foreground">
               <Film className="size-8" />
               <p className="text-sm">Vui lòng chọn mùa và tập để quản lý nguồn phát.</p>
            </div>
         )}

         {/* Sources management — shown when we have enough context */}
         {canShowSources && (
            <>
               {/* Header */}
               <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{sources.length} nguồn phát</p>
                  <Button size="sm" variant="outline" onClick={handleOpenCreate}>
                     <Plus className="mr-1 h-4 w-4" /> Thêm nguồn phát
                  </Button>
               </div>

               {/* Table */}
               {isLoading ? (
                  <div className="flex min-h-[20vh] items-center justify-center">
                     <Loader2 className="size-6 animate-spin text-primary" />
                  </div>
               ) : (
                  <div className="rounded-lg border border-border bg-card">
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead className="w-24">Loại</TableHead>
                              <TableHead>URL</TableHead>
                              <TableHead className="w-28">Nhãn</TableHead>
                              <TableHead className="hidden w-20 sm:table-cell">
                                 Chất lượng
                              </TableHead>
                              <TableHead className="hidden w-20 md:table-cell">
                                 Ngôn ngữ
                              </TableHead>
                              <TableHead className="hidden w-16 md:table-cell">Ưu tiên</TableHead>
                              <TableHead className="w-20">Trạng thái</TableHead>
                              <TableHead className="w-24 text-right">Thao tác</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {sources.length > 0 ? (
                              sources.map((source) => (
                                 <TableRow key={source.id}>
                                    <TableCell>
                                       <Badge variant="outline" className="text-xs">
                                          <SourceTypeIcon type={source.sourceType} />
                                          {source.sourceType}
                                       </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate font-mono text-xs">
                                       {source.sourceUrl}
                                    </TableCell>
                                    <TableCell>{source.label || '—'}</TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                       {source.quality || '—'}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                       {source.language || '—'}
                                    </TableCell>
                                    <TableCell className="hidden text-center md:table-cell">
                                       {source.priority}
                                    </TableCell>
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
                                       <div className="flex items-center justify-end gap-1">
                                          <Button
                                             variant="ghost"
                                             size="icon-xs"
                                             onClick={() => handleOpenEdit(source)}
                                          >
                                             <Edit className="size-3" />
                                             <span className="sr-only">Sửa</span>
                                          </Button>
                                          <Button
                                             variant="ghost"
                                             size="icon-xs"
                                             onClick={() => setDeleteTarget(source)}
                                             className="text-destructive hover:text-destructive"
                                          >
                                             <Trash2 className="size-3" />
                                             <span className="sr-only">Xóa</span>
                                          </Button>
                                       </div>
                                    </TableCell>
                                 </TableRow>
                              ))
                           ) : (
                              <TableRow>
                                 <TableCell
                                    colSpan={8}
                                    className="py-8 text-center text-muted-foreground"
                                 >
                                    Chưa có nguồn phát nào. Bấm &quot;Thêm nguồn phát&quot; để thêm.
                                 </TableCell>
                              </TableRow>
                           )}
                        </TableBody>
                     </Table>
                  </div>
               )}
            </>
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
            description={
               isTv && selectedSeason != null && selectedEpisode != null
                  ? `Thêm nguồn phát cho "${mediaTitle}" — Mùa ${selectedSeason}, Tập ${selectedEpisode}.`
                  : `Thêm nguồn phát mới cho "${mediaTitle}".`
            }
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

         {/* Delete Confirm */}
         <ConfirmDialog
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            title="Xóa nguồn phát"
            description={`Xác nhận xóa nguồn "${deleteTarget?.label || deleteTarget?.sourceUrl}"? Hành động này không thể hoàn tác.`}
            isLoading={deleteMutation.isPending}
         />
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
