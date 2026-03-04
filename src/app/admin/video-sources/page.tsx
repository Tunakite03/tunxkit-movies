'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
   Video,
} from 'lucide-react';

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

   // Dialog state
   const [isCreateOpen, setIsCreateOpen] = useState(false);
   const [editTarget, setEditTarget] = useState<AdminVideoSource | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<AdminVideoSource | null>(null);

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

   // ─── Handlers ──────────────────────────────────────────────

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
            className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4"
         >
            <div className="space-y-1">
               <span className="text-xs font-medium text-muted-foreground">Loại</span>
               <Select
                  value={search.mediaType}
                  onValueChange={(v) =>
                     setSearch((prev) => ({ ...prev, mediaType: v as 'movie' | 'tv' }))
                  }
               >
                  <SelectTrigger className="w-32">
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="movie">Phim lẻ</SelectItem>
                     <SelectItem value="tv">Phim bộ</SelectItem>
                  </SelectContent>
               </Select>
            </div>
            <div className="space-y-1">
               <span className="text-xs font-medium text-muted-foreground">TMDB ID</span>
               <Input
                  type="number"
                  placeholder="VD: 550"
                  value={search.mediaId}
                  onChange={(e) => setSearch((prev) => ({ ...prev, mediaId: e.target.value }))}
                  className="w-32"
                  min={1}
               />
            </div>
            {search.mediaType === 'tv' && (
               <>
                  <div className="space-y-1">
                     <span className="text-xs font-medium text-muted-foreground">Mùa</span>
                     <Input
                        type="number"
                        placeholder="VD: 1"
                        value={search.season}
                        onChange={(e) => setSearch((prev) => ({ ...prev, season: e.target.value }))}
                        className="w-24"
                        min={0}
                     />
                  </div>
                  <div className="space-y-1">
                     <span className="text-xs font-medium text-muted-foreground">Tập</span>
                     <Input
                        type="number"
                        placeholder="VD: 1"
                        value={search.episode}
                        onChange={(e) =>
                           setSearch((prev) => ({ ...prev, episode: e.target.value }))
                        }
                        className="w-24"
                        min={0}
                     />
                  </div>
               </>
            )}
            <Button type="submit" size="sm" disabled={!search.mediaId.trim()}>
               <Search className="mr-1.5 size-3.5" />
               Tìm nguồn phát
            </Button>
         </form>

         {/* Results */}
         {activeSearch && (
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Video className="size-5 text-primary" />
                     <h2 className="text-lg font-semibold">
                        {activeSearch.mediaType === 'movie' ? 'Phim lẻ' : 'Phim bộ'} #
                        {activeSearch.mediaId}
                        {activeSearch.mediaType === 'tv' && activeSearch.season && (
                           <span className="text-muted-foreground">
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
