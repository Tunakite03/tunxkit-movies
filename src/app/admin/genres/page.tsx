'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, Film, Tv, Trash2, Pencil, Check, X } from 'lucide-react';

import {
   getAdminGenres,
   createAdminGenre,
   updateAdminGenre,
   deleteAdminGenre,
} from '@/services/admin-dashboard-service';
import type { CreateGenreData } from '@/services/admin-dashboard-service';
import { useAuthStore } from '@/store/auth-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { CreateGenreDialog } from '@/components/admin/create-genre-dialog';

/** Inline editable genre row */
function GenreRow({
   genre,
   countField,
   onUpdate,
   onDelete,
   isUpdating,
}: {
   readonly genre: { id: number; name: string; _count: { movies?: number; tvShows?: number } };
   readonly countField: 'movies' | 'tvShows';
   readonly onUpdate: (id: number, name: string) => void;
   readonly onDelete: (id: number, name: string) => void;
   readonly isUpdating: boolean;
}) {
   const [isEditing, setIsEditing] = useState(false);
   const [editName, setEditName] = useState(genre.name);

   const handleSave = () => {
      if (editName.trim() && editName.trim() !== genre.name) {
         onUpdate(genre.id, editName.trim());
      }
      setIsEditing(false);
   };

   const handleCancel = () => {
      setEditName(genre.name);
      setIsEditing(false);
   };

   return (
      <TableRow>
         <TableCell className="font-mono text-xs text-muted-foreground">{genre.id}</TableCell>
         <TableCell>
            {isEditing ? (
               <div className="flex items-center gap-1">
                  <Input
                     value={editName}
                     onChange={(e) => setEditName(e.target.value)}
                     className="h-7 text-sm"
                     autoFocus
                     onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                     }}
                  />
                  <Button variant="ghost" size="icon-xs" onClick={handleSave} disabled={isUpdating}>
                     <Check className="h-3 w-3 text-green-500" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={handleCancel}>
                     <X className="h-3 w-3" />
                  </Button>
               </div>
            ) : (
               <span className="font-medium">{genre.name}</span>
            )}
         </TableCell>
         <TableCell className="text-right">
            <Badge variant="secondary">
               {(countField === 'movies'
                  ? genre._count.movies
                  : genre._count.tvShows
               )?.toLocaleString() ?? 0}
            </Badge>
         </TableCell>
         <TableCell className="text-right">
            <div className="flex items-center justify-end gap-1">
               <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setIsEditing(true)}
                  disabled={isEditing}
               >
                  <Pencil className="h-3 w-3" />
               </Button>
               <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onDelete(genre.id, genre.name)}
                  className="text-destructive hover:text-destructive"
               >
                  <Trash2 className="h-3 w-3" />
               </Button>
            </div>
         </TableCell>
      </TableRow>
   );
}

export default function AdminGenresPage() {
   const { token } = useAuthStore();
   const queryClient = useQueryClient();
   const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

   const { data, isLoading } = useQuery({
      queryKey: ['admin-genres'],
      queryFn: () => getAdminGenres(token as string),
      enabled: !!token,
   });

   const createMutation = useMutation({
      mutationFn: (genreData: CreateGenreData) => createAdminGenre(genreData, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-genres'] });
         queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      },
   });

   const updateMutation = useMutation({
      mutationFn: ({ id, name }: { id: number; name: string }) =>
         updateAdminGenre(id, { name }, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-genres'] });
      },
   });

   const deleteMutation = useMutation({
      mutationFn: (genreId: number) => deleteAdminGenre(genreId, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-genres'] });
         queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
         setDeleteTarget(null);
      },
   });

   const handleUpdate = (id: number, name: string) => {
      updateMutation.mutate({ id, name });
   };

   const handleDelete = (id: number, name: string) => {
      setDeleteTarget({ id, name });
   };

   return (
      <div className="space-y-6">
         <AdminPageHeader
            title="Quản lý Thể loại"
            description="Xem, thêm, sửa và xóa thể loại phim"
            icon={<Tag className="h-6 w-6 text-amber-500" />}
            actions={
               <CreateGenreDialog
                  onSubmit={(data) => createMutation.mutate(data)}
                  isPending={createMutation.isPending}
                  isSuccess={createMutation.isSuccess}
               />
            }
         />

         <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Movie Genres */}
            <div className="rounded-lg border border-border bg-card p-4">
               <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-card-foreground">
                  <Film className="h-4 w-4 text-blue-500" />
                  Thể loại Phim lẻ
               </h2>
               {isLoading ? (
                  <div className="space-y-3">
                     {Array.from({ length: 5 }).map((_, i) => (
                        <div
                           key={`skeleton-movie-genre-${i}`}
                           className="h-8 animate-pulse rounded bg-muted"
                        />
                     ))}
                  </div>
               ) : (
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead className="w-16">ID</TableHead>
                           <TableHead>Tên thể loại</TableHead>
                           <TableHead className="text-right">Số phim</TableHead>
                           <TableHead className="w-20 text-right">Thao tác</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {data?.movieGenres.map((genre) => (
                           <GenreRow
                              key={genre.id}
                              genre={genre}
                              countField="movies"
                              onUpdate={handleUpdate}
                              onDelete={handleDelete}
                              isUpdating={updateMutation.isPending}
                           />
                        ))}
                        {!data?.movieGenres.length && (
                           <TableRow>
                              <TableCell
                                 colSpan={4}
                                 className="py-4 text-center text-muted-foreground"
                              >
                                 Chưa có thể loại
                              </TableCell>
                           </TableRow>
                        )}
                     </TableBody>
                  </Table>
               )}
            </div>

            {/* TV Genres */}
            <div className="rounded-lg border border-border bg-card p-4">
               <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-card-foreground">
                  <Tv className="h-4 w-4 text-purple-500" />
                  Thể loại Phim bộ
               </h2>
               {isLoading ? (
                  <div className="space-y-3">
                     {Array.from({ length: 5 }).map((_, i) => (
                        <div
                           key={`skeleton-tv-genre-${i}`}
                           className="h-8 animate-pulse rounded bg-muted"
                        />
                     ))}
                  </div>
               ) : (
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead className="w-16">ID</TableHead>
                           <TableHead>Tên thể loại</TableHead>
                           <TableHead className="text-right">Số phim</TableHead>
                           <TableHead className="w-20 text-right">Thao tác</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {data?.tvGenres.map((genre) => (
                           <GenreRow
                              key={genre.id}
                              genre={genre}
                              countField="tvShows"
                              onUpdate={handleUpdate}
                              onDelete={handleDelete}
                              isUpdating={updateMutation.isPending}
                           />
                        ))}
                        {!data?.tvGenres.length && (
                           <TableRow>
                              <TableCell
                                 colSpan={4}
                                 className="py-4 text-center text-muted-foreground"
                              >
                                 Chưa có thể loại
                              </TableCell>
                           </TableRow>
                        )}
                     </TableBody>
                  </Table>
               )}
            </div>
         </div>

         <ConfirmDialog
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            title="Xóa thể loại"
            description={`Bạn có chắc muốn xóa thể loại "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
            isLoading={deleteMutation.isPending}
         />
      </div>
   );
}
