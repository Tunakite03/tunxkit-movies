'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tv, Trash2, ExternalLink, Eye } from 'lucide-react';
import Link from 'next/link';

import {
   getAdminTVShows,
   deleteAdminTVShow,
   createAdminTVShow,
   exportTVShowsCsv,
   importTVShowsCsv,
} from '@/services/admin-dashboard-service';
import type { CreateTVShowData } from '@/services/admin-dashboard-service';
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
import { CreateTVShowDialog } from '@/components/admin/create-tvshow-dialog';
import { ImportExportActions } from '@/components/admin/import-export-actions';
import { useAdminSearchParams } from '@/hooks';

export default function AdminTVShowsPage() {
   const { token } = useAuthStore();
   const queryClient = useQueryClient();

   const { page, search, setPage, setSearch } = useAdminSearchParams();
   const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

   const { data, isLoading } = useQuery({
      queryKey: ['admin-tv-shows', page, search],
      queryFn: () => getAdminTVShows(token as string, page, search || undefined),
      enabled: !!token,
   });

   const deleteMutation = useMutation({
      mutationFn: (tvShowId: number) => deleteAdminTVShow(tvShowId, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-tv-shows'] });
         queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
         setDeleteTarget(null);
      },
   });

   const createMutation = useMutation({
      mutationFn: (data: CreateTVShowData) => createAdminTVShow(data, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-tv-shows'] });
         queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      },
   });

   const handleSearch = useCallback(
      (query: string) => {
         setSearch(query);
      },
      [setSearch],
   );

   const handleExport = useCallback(() => exportTVShowsCsv(token as string), [token]);

   const handleImport = useCallback(
      (file: File, mode: 'skip' | 'upsert') => {
         return importTVShowsCsv(file, mode, token as string).then((result) => {
            queryClient.invalidateQueries({ queryKey: ['admin-tv-shows'] });
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
            return result;
         });
      },
      [token, queryClient],
   );

   return (
      <div className="space-y-6">
         <AdminPageHeader
            title="Quản lý Phim bộ"
            description="Xem, tìm kiếm và quản lý danh sách TV shows"
            icon={<Tv className="h-6 w-6 text-purple-500" />}
            actions={
               <>
                  <ImportExportActions
                     entityLabel="Phim bộ"
                     onExport={handleExport}
                     onImport={handleImport}
                     sampleCsvUrl="/samples/tv-shows-sample.csv"
                  />
                  <CreateTVShowDialog
                     onSubmit={(data) => createMutation.mutate(data)}
                     isPending={createMutation.isPending}
                     isSuccess={createMutation.isSuccess}
                  />
               </>
            }
         />

         <AdminSearchBar
            placeholder="Tìm kiếm phim bộ..."
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
                     <TableHead className="hidden md:table-cell">Ngày phát sóng</TableHead>
                     <TableHead className="hidden sm:table-cell">Đánh giá</TableHead>
                     <TableHead className="hidden lg:table-cell">Seasons</TableHead>
                     <TableHead className="hidden lg:table-cell">Tập</TableHead>
                     <TableHead className="hidden lg:table-cell">Trạng thái</TableHead>
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
                     data.results.map((show) => (
                        <TableRow key={show.id}>
                           <TableCell className="font-mono text-xs text-muted-foreground">
                              {show.id}
                           </TableCell>
                           <TableCell className="max-w-[250px] truncate font-medium">
                              <Link href={`/admin/tv-shows/${show.id}`} className="hover:underline">
                                 {show.name}
                              </Link>
                           </TableCell>
                           <TableCell className="hidden text-muted-foreground md:table-cell">
                              {show.firstAirDate || '—'}
                           </TableCell>
                           <TableCell className="hidden sm:table-cell">
                              <span className="text-amber-500">★</span>{' '}
                              {show.voteAverage.toFixed(1)}
                           </TableCell>
                           <TableCell className="hidden text-muted-foreground lg:table-cell">
                              {show.numberOfSeasons}
                           </TableCell>
                           <TableCell className="hidden text-muted-foreground lg:table-cell">
                              {show.numberOfEpisodes}
                           </TableCell>
                           <TableCell className="hidden lg:table-cell">
                              <Badge variant="outline">{show.status || 'N/A'}</Badge>
                           </TableCell>
                           <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                 <Button variant="ghost" size="icon-xs" asChild>
                                    <Link href={`/admin/tv-shows/${show.id}`}>
                                       <Eye className="h-3 w-3" />
                                    </Link>
                                 </Button>
                                 <Button variant="ghost" size="icon-xs" asChild>
                                    <Link href={`/tv/${show.id}`} target="_blank">
                                       <ExternalLink className="h-3 w-3" />
                                    </Link>
                                 </Button>
                                 <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() =>
                                       setDeleteTarget({ id: show.id, name: show.name })
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
                              ? `Không tìm thấy phim bộ với từ khóa "${search}"`
                              : 'Chưa có phim bộ nào'}
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
            title="Xóa phim bộ"
            description={`Bạn có chắc muốn xóa "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
            isLoading={deleteMutation.isPending}
         />
      </div>
   );
}
