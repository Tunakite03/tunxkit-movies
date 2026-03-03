'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import { getAdminPeople } from '@/services/admin-dashboard-service';
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

export default function AdminPeoplePage() {
   const { token } = useAuthStore();

   const [page, setPage] = useState(1);
   const [search, setSearch] = useState('');

   const { data, isLoading } = useQuery({
      queryKey: ['admin-people', page, search],
      queryFn: () => getAdminPeople(token as string, page, search || undefined),
      enabled: !!token,
   });

   const handleSearch = useCallback((query: string) => {
      setSearch(query);
      setPage(1);
   }, []);

   return (
      <div className="space-y-6">
         <AdminPageHeader
            title="Quản lý Diễn viên"
            description="Xem và tìm kiếm danh sách diễn viên"
            icon={<UserCircle className="h-6 w-6 text-cyan-500" />}
         />

         <AdminSearchBar
            placeholder="Tìm kiếm diễn viên..."
            onSearch={handleSearch}
            isLoading={isLoading}
         />

         <div className="rounded-lg border border-border bg-card">
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead className="w-16">ID</TableHead>
                     <TableHead>Tên</TableHead>
                     <TableHead className="hidden sm:table-cell">Vai trò chính</TableHead>
                     <TableHead className="hidden md:table-cell">Độ phổ biến</TableHead>
                     <TableHead className="hidden lg:table-cell">Phim lẻ</TableHead>
                     <TableHead className="hidden lg:table-cell">Phim bộ</TableHead>
                     <TableHead className="w-16 text-right">Xem</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {isLoading ? (
                     Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={`skeleton-${i}`}>
                           <TableCell colSpan={7}>
                              <div className="h-8 animate-pulse rounded bg-muted" />
                           </TableCell>
                        </TableRow>
                     ))
                  ) : data?.results.length ? (
                     data.results.map((person) => (
                        <TableRow key={person.id}>
                           <TableCell className="font-mono text-xs text-muted-foreground">
                              {person.id}
                           </TableCell>
                           <TableCell className="max-w-[250px] truncate font-medium">
                              {person.name}
                           </TableCell>
                           <TableCell className="hidden sm:table-cell">
                              <Badge variant="secondary">
                                 {person.knownForDepartment || 'N/A'}
                              </Badge>
                           </TableCell>
                           <TableCell className="hidden text-muted-foreground md:table-cell">
                              {person.popularity.toFixed(1)}
                           </TableCell>
                           <TableCell className="hidden text-muted-foreground lg:table-cell">
                              {person._count.movieCast}
                           </TableCell>
                           <TableCell className="hidden text-muted-foreground lg:table-cell">
                              {person._count.tvCast}
                           </TableCell>
                           <TableCell className="text-right">
                              <Button variant="ghost" size="icon-xs" asChild>
                                 <Link href={`/people/${person.id}`} target="_blank">
                                    <ExternalLink className="h-3 w-3" />
                                 </Link>
                              </Button>
                           </TableCell>
                        </TableRow>
                     ))
                  ) : (
                     <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                           {search
                              ? `Không tìm thấy diễn viên với từ khóa "${search}"`
                              : 'Chưa có diễn viên nào'}
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
      </div>
   );
}
