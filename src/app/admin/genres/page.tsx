'use client';

import { useQuery } from '@tanstack/react-query';
import { Tag, Film, Tv } from 'lucide-react';

import { getAdminGenres } from '@/services/admin-dashboard-service';
import { useAuthStore } from '@/store/auth-store';
import { Badge } from '@/components/ui/badge';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table';
import { AdminPageHeader } from '@/components/admin/admin-shared';

export default function AdminGenresPage() {
   const { token } = useAuthStore();

   const { data, isLoading } = useQuery({
      queryKey: ['admin-genres'],
      queryFn: () => getAdminGenres(token as string),
      enabled: !!token,
   });

   return (
      <div className="space-y-6">
         <AdminPageHeader
            title="Quản lý Thể loại"
            description="Xem danh sách thể loại phim và TV shows"
            icon={<Tag className="h-6 w-6 text-amber-500" />}
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
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {data?.movieGenres.map((genre) => (
                           <TableRow key={genre.id}>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                 {genre.id}
                              </TableCell>
                              <TableCell className="font-medium">{genre.name}</TableCell>
                              <TableCell className="text-right">
                                 <Badge variant="secondary">
                                    {genre._count.movies?.toLocaleString() ?? 0}
                                 </Badge>
                              </TableCell>
                           </TableRow>
                        ))}
                        {!data?.movieGenres.length && (
                           <TableRow>
                              <TableCell
                                 colSpan={3}
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
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {data?.tvGenres.map((genre) => (
                           <TableRow key={genre.id}>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                 {genre.id}
                              </TableCell>
                              <TableCell className="font-medium">{genre.name}</TableCell>
                              <TableCell className="text-right">
                                 <Badge variant="secondary">
                                    {genre._count.tvShows?.toLocaleString() ?? 0}
                                 </Badge>
                              </TableCell>
                           </TableRow>
                        ))}
                        {!data?.tvGenres.length && (
                           <TableRow>
                              <TableCell
                                 colSpan={3}
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
      </div>
   );
}
