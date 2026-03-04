'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Film, Trash2, ExternalLink, Eye } from 'lucide-react';
import Link from 'next/link';

import {
   getAdminMovies,
   deleteAdminMovie,
   createAdminMovie,
} from '@/services/admin-dashboard-service';
import type { CreateMovieData } from '@/services/admin-dashboard-service';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table';
import { AdminSearchBar, AdminPagination, AdminPageHeader } from '@/components/admin/admin-shared';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { CreateMovieDialog } from '@/components/admin/create-movie-dialog';
import { useAdminSearchParams } from '@/hooks';

export default function AdminMoviesPage() {
   const { token } = useAuthStore();
   const queryClient = useQueryClient();

   const { page, search, setPage, setSearch } = useAdminSearchParams();
   const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

   const { data, isLoading } = useQuery({
      queryKey: ['admin-movies', page, search],
      queryFn: () => getAdminMovies(token as string, page, search || undefined),
      enabled: !!token,
   });

   const deleteMutation = useMutation({
      mutationFn: (movieId: number) => deleteAdminMovie(movieId, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
         queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
         setDeleteTarget(null);
      },
   });

   const createMutation = useMutation({
      mutationFn: (data: CreateMovieData) => createAdminMovie(data, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
         queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      },
   });

   const handleSearch = useCallback(
      (query: string) => {
         setSearch(query);
      },
      [setSearch],
   );

   return (
      <div className="space-y-6">
         <AdminPageHeader
            title="Quản lý Phim lẻ"
            description="Xem, tìm kiếm và quản lý danh sách phim"
            icon={<Film className="h-6 w-6 text-blue-500" />}
            actions={
               <CreateMovieDialog
                  onSubmit={(data) => createMutation.mutate(data)}
                  isPending={createMutation.isPending}
                  isSuccess={createMutation.isSuccess}
               />
            }
         />

         <AdminSearchBar
            placeholder="Tìm kiếm phim..."
            initialQuery={search}
            onSearch={handleSearch}
            isLoading={isLoading}
         />

         <div className="rounded-lg border border-border bg-card">
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead className="w-16">ID</TableHead>
                     <TableHead>Tên phim</TableHead>
                     <TableHead className="hidden md:table-cell">Ngày phát hành</TableHead>
                     <TableHead className="hidden sm:table-cell">Đánh giá</TableHead>
                     <TableHead className="hidden lg:table-cell">Trạng thái</TableHead>
                     <TableHead className="hidden lg:table-cell">Diễn viên</TableHead>
                     <TableHead className="hidden lg:table-cell">Videos</TableHead>
                     <TableHead className="w-24 text-right">Thao tác</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {isLoading ? (
                     Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={`skeleton-${i}`}>
                           <TableCell colSpan={8}>
                              <div className="h-8 animate-pulse rounded bg-muted" />
                           </TableCell>
                        </TableRow>
                     ))
                  ) : data?.results.length ? (
                     data.results.map((movie) => (
                        <TableRow key={movie.id}>
                           <TableCell className="font-mono text-xs text-muted-foreground">
                              {movie.id}
                           </TableCell>
                           <TableCell className="max-w-[250px] truncate font-medium">
                              {movie.title}
                           </TableCell>
                           <TableCell className="hidden text-muted-foreground md:table-cell">
                              {movie.releaseDate || '—'}
                           </TableCell>
                           <TableCell className="hidden sm:table-cell">
                              <span className="text-amber-500">★</span>{' '}
                              {movie.voteAverage.toFixed(1)}
                           </TableCell>
                           <TableCell className="hidden lg:table-cell">
                              <Badge variant="outline">{movie.status || 'N/A'}</Badge>
                           </TableCell>
                           <TableCell className="hidden text-muted-foreground lg:table-cell">
                              {movie._count.cast}
                           </TableCell>
                           <TableCell className="hidden text-muted-foreground lg:table-cell">
                              {movie._count.videos}
                           </TableCell>
                           <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                 <Button variant="ghost" size="icon-xs" asChild>
                                    <Link href={`/admin/movies/${movie.id}`}>
                                       <Eye className="h-3 w-3" />
                                    </Link>
                                 </Button>
                                 <Button variant="ghost" size="icon-xs" asChild>
                                    <Link href={`/movies/${movie.id}`} target="_blank">
                                       <ExternalLink className="h-3 w-3" />
                                    </Link>
                                 </Button>
                                 <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() =>
                                       setDeleteTarget({ id: movie.id, title: movie.title })
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
                        <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                           {search
                              ? `Không tìm thấy phim với từ khóa "${search}"`
                              : 'Chưa có phim nào'}
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </div>

         {data && data.total_pages > 1 && (
            <AdminPagination
               page={data.page}
               totalPages={data.total_pages}
               totalResults={data.total_results}
               onPageChange={setPage}
               isLoading={isLoading}
            />
         )}

         <ConfirmDialog
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            title="Xóa phim"
            description={`Bạn có chắc muốn xóa phim "${deleteTarget?.title}"? Hành động này không thể hoàn tác.`}
            isLoading={deleteMutation.isPending}
         />
      </div>
   );
}
