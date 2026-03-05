'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Trash2, ShieldCheck, Shield, Eye } from 'lucide-react';
import Link from 'next/link';

import {
   getAdminUsers,
   updateUserRole,
   deleteAdminUser,
   createAdminUser,
} from '@/services/admin-dashboard-service';
import type { CreateUserData } from '@/services/admin-dashboard-service';
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
import { CreateUserDialog } from '@/components/admin/create-user-dialog';
import { useAdminSearchParams } from '@/hooks';

export default function AdminUsersPage() {
   const { token, user: currentUser } = useAuthStore();
   const queryClient = useQueryClient();

   const { page, search, setPage, setSearch } = useAdminSearchParams();
   const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
   const [roleTarget, setRoleTarget] = useState<{
      id: string;
      name: string;
      newRole: 'USER' | 'ADMIN';
   } | null>(null);

   const { data, isLoading } = useQuery({
      queryKey: ['admin-users', page, search],
      queryFn: () => getAdminUsers(token as string, page, search || undefined),
      enabled: !!token,
   });

   const deleteMutation = useMutation({
      mutationFn: (userId: string) => deleteAdminUser(userId, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-users'] });
         queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
         setDeleteTarget(null);
      },
   });

   const roleMutation = useMutation({
      mutationFn: ({ userId, role }: { userId: string; role: 'USER' | 'ADMIN' }) =>
         updateUserRole(userId, role, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-users'] });
         setRoleTarget(null);
      },
   });

   const createMutation = useMutation({
      mutationFn: (data: CreateUserData) => createAdminUser(data, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-users'] });
         queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      },
   });

   const handleSearch = useCallback(
      (query: string) => {
         setSearch(query);
      },
      [setSearch],
   );

   const formatDate = (dateStr: string) => {
      try {
         return new Date(dateStr).toLocaleDateString('vi-VN');
      } catch {
         return dateStr;
      }
   };

   return (
      <div className="space-y-6">
         <AdminPageHeader
            title="Quản lý Người dùng"
            description="Quản lý tài khoản, phân quyền người dùng"
            icon={<Users className="h-6 w-6 text-green-500" />}
            actions={
               <CreateUserDialog
                  onSubmit={(data) => createMutation.mutate(data)}
                  isPending={createMutation.isPending}
                  isSuccess={createMutation.isSuccess}
                  onSuccessHandled={() => createMutation.reset()}
               />
            }
         />

         <AdminSearchBar
            placeholder="Tìm theo tên hoặc email..."
            initialQuery={search}
            onSearch={handleSearch}
            isLoading={isLoading}
         />

         <div className="rounded-lg border border-border bg-card">
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead>Tên</TableHead>
                     <TableHead>Email</TableHead>
                     <TableHead className="hidden sm:table-cell">Vai trò</TableHead>
                     <TableHead className="hidden md:table-cell">Watchlist</TableHead>
                     <TableHead className="hidden lg:table-cell">Ngày tạo</TableHead>
                     <TableHead className="w-28 text-right">Thao tác</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {isLoading ? (
                     Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={`skeleton-${i}`}>
                           <TableCell colSpan={6}>
                              <div className="h-8 animate-pulse rounded bg-muted" />
                           </TableCell>
                        </TableRow>
                     ))
                  ) : data?.results.length ? (
                     data.results.map((user) => {
                        const isCurrentUser = user.id === currentUser?.id;
                        return (
                           <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                 <div className="flex items-center gap-2">
                                    <Link
                                       href={`/admin/users/${user.id}`}
                                       className="hover:text-primary hover:underline"
                                    >
                                       {user.name ?? 'Chưa đặt tên'}
                                    </Link>
                                    {isCurrentUser && (
                                       <Badge variant="outline" className="text-xs">
                                          Bạn
                                       </Badge>
                                    )}
                                 </div>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                 {user.email}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                 <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                    {user.role === 'ADMIN' ? (
                                       <span className="flex items-center gap-1">
                                          <ShieldCheck className="h-3 w-3" /> Admin
                                       </span>
                                    ) : (
                                       'User'
                                    )}
                                 </Badge>
                              </TableCell>
                              <TableCell className="hidden text-muted-foreground md:table-cell">
                                 {user._count.watchlist}
                              </TableCell>
                              <TableCell className="hidden text-muted-foreground lg:table-cell">
                                 {formatDate(user.createdAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                 <div className="flex items-center justify-end gap-1">
                                    <Button
                                       variant="ghost"
                                       size="icon-xs"
                                       asChild
                                       title="Xem chi tiết"
                                    >
                                       <Link href={`/admin/users/${user.id}`}>
                                          <Eye className="h-3 w-3" />
                                       </Link>
                                    </Button>
                                    {!isCurrentUser && (
                                       <>
                                          <Button
                                             variant="ghost"
                                             size="icon-xs"
                                             onClick={() =>
                                                setRoleTarget({
                                                   id: user.id,
                                                   name: user.name ?? user.email,
                                                   newRole:
                                                      user.role === 'ADMIN' ? 'USER' : 'ADMIN',
                                                })
                                             }
                                             title={
                                                user.role === 'ADMIN'
                                                   ? 'Hạ xuống User'
                                                   : 'Nâng lên Admin'
                                             }
                                          >
                                             <Shield className="h-3 w-3" />
                                          </Button>
                                          <Button
                                             variant="ghost"
                                             size="icon-xs"
                                             onClick={() =>
                                                setDeleteTarget({
                                                   id: user.id,
                                                   name: user.name ?? user.email,
                                                })
                                             }
                                             className="text-destructive hover:text-destructive"
                                          >
                                             <Trash2 className="h-3 w-3" />
                                          </Button>
                                       </>
                                    )}
                                 </div>
                              </TableCell>
                           </TableRow>
                        );
                     })
                  ) : (
                     <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                           {search
                              ? `Không tìm thấy người dùng với từ khóa "${search}"`
                              : 'Chưa có người dùng'}
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

         {/* Delete confirmation */}
         <ConfirmDialog
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            title="Xóa người dùng"
            description={`Bạn có chắc muốn xóa người dùng "${deleteTarget?.name}"? Tất cả dữ liệu liên quan sẽ bị xóa. Hành động này không thể hoàn tác.`}
            isLoading={deleteMutation.isPending}
         />

         {/* Role change confirmation */}
         <ConfirmDialog
            isOpen={!!roleTarget}
            onClose={() => setRoleTarget(null)}
            onConfirm={() =>
               roleTarget &&
               roleMutation.mutate({ userId: roleTarget.id, role: roleTarget.newRole })
            }
            title="Thay đổi vai trò"
            description={`Bạn có chắc muốn ${
               roleTarget?.newRole === 'ADMIN' ? 'nâng' : 'hạ'
            } "${roleTarget?.name}" lên vai trò ${roleTarget?.newRole}?`}
            isLoading={roleMutation.isPending}
            variant="default"
         />
      </div>
   );
}
