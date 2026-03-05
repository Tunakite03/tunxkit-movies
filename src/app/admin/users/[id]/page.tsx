'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
   User,
   ArrowLeft,
   Pencil,
   Trash2,
   ShieldCheck,
   Shield,
   Mail,
   Calendar,
   Clock,
   BookmarkPlus,
   Link2,
   Loader2,
   CheckCircle2,
   XCircle,
} from 'lucide-react';
import Image from 'next/image';

import {
   getAdminUserDetail,
   updateAdminUser,
   deleteAdminUser,
} from '@/services/admin-dashboard-service';
import type { UpdateUserData } from '@/services/admin-dashboard-service';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminPageHeader } from '@/components/admin/admin-shared';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EditUserDialog } from '@/components/admin/edit-user-dialog';

function formatDate(dateStr: string | null) {
   if (!dateStr) return '—';
   try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
      });
   } catch {
      return dateStr;
   }
}

export default function AdminUserDetailPage() {
   const params = useParams();
   const router = useRouter();
   const userId = params.id as string;
   const { token, user: currentUser } = useAuthStore();
   const queryClient = useQueryClient();

   const [isEditOpen, setIsEditOpen] = useState(false);
   const [isDeleteOpen, setIsDeleteOpen] = useState(false);

   const isCurrentUser = currentUser?.id === userId;

   const { data, isLoading } = useQuery({
      queryKey: ['admin-user-detail', userId],
      queryFn: () => getAdminUserDetail(userId, token as string),
      enabled: !!token && !!userId,
   });

   const updateMutation = useMutation({
      mutationFn: (payload: UpdateUserData) => updateAdminUser(userId, payload, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] });
         queryClient.invalidateQueries({ queryKey: ['admin-users'] });
         setIsEditOpen(false);
      },
   });

   const deleteMutation = useMutation({
      mutationFn: () => deleteAdminUser(userId, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-users'] });
         queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
         router.push('/admin/users');
      },
   });

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
            <p className="text-center text-muted-foreground">Không tìm thấy người dùng</p>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <AdminPageHeader
            title={data.name ?? 'Chưa đặt tên'}
            description={data.email}
            icon={<User className="h-6 w-6 text-green-500" />}
            actions={
               <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push('/admin/users')}>
                     <ArrowLeft className="mr-1 h-3 w-3" /> Quay lại
                  </Button>
                  <Button size="sm" onClick={() => setIsEditOpen(true)}>
                     <Pencil className="mr-1 h-3 w-3" /> Chỉnh sửa
                  </Button>
                  {!isCurrentUser && (
                     <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setIsDeleteOpen(true)}
                     >
                        <Trash2 className="mr-1 h-3 w-3" /> Xóa
                     </Button>
                  )}
               </div>
            }
         />

         {/* User Profile Card */}
         <div className="flex gap-4 rounded-lg border border-border bg-card p-6">
            {data.image ? (
               <Image
                  src={data.image}
                  alt={data.name ?? 'Avatar'}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-lg object-cover"
               />
            ) : (
               <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-muted">
                  <User className="h-10 w-10 text-muted-foreground" />
               </div>
            )}
            <div className="flex flex-1 flex-col gap-3">
               <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{data.name ?? 'Chưa đặt tên'}</h2>
                  <Badge variant={data.role === 'ADMIN' ? 'default' : 'secondary'}>
                     {data.role === 'ADMIN' ? (
                        <span className="flex items-center gap-1">
                           <ShieldCheck className="h-3 w-3" /> Admin
                        </span>
                     ) : (
                        <span className="flex items-center gap-1">
                           <Shield className="h-3 w-3" /> User
                        </span>
                     )}
                  </Badge>
                  {isCurrentUser && (
                     <Badge variant="outline" className="text-xs">
                        Bạn
                     </Badge>
                  )}
               </div>
               <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" /> {data.email}
               </p>
            </div>
         </div>

         {/* Details Grid */}
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DetailCard
               icon={<CheckCircle2 className="h-5 w-5" />}
               label="Email xác thực"
               value={
                  data.emailVerified ? (
                     <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle2 className="h-4 w-4" /> Đã xác thực
                     </span>
                  ) : (
                     <span className="flex items-center gap-1 text-muted-foreground">
                        <XCircle className="h-4 w-4" /> Chưa xác thực
                     </span>
                  )
               }
            />
            <DetailCard
               icon={<BookmarkPlus className="h-5 w-5" />}
               label="Watchlist"
               value={`${data._count.watchlist} mục`}
            />
            <DetailCard
               icon={<Link2 className="h-5 w-5" />}
               label="Tài khoản liên kết"
               value={
                  data._count.accounts > 0
                     ? `${data._count.accounts} tài khoản (OAuth)`
                     : 'Chỉ mật khẩu'
               }
            />
            <DetailCard
               icon={<Calendar className="h-5 w-5" />}
               label="Ngày tạo"
               value={formatDate(data.createdAt)}
            />
         </div>

         {/* Timestamps */}
         <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-medium text-foreground">Thông tin thời gian</h3>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
               <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Ngày tạo: {formatDate(data.createdAt)}</span>
               </div>
               <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Cập nhật lần cuối: {formatDate(data.updatedAt)}</span>
               </div>
               {data.emailVerified && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                     <Mail className="h-4 w-4" />
                     <span>Xác thực email: {formatDate(data.emailVerified)}</span>
                  </div>
               )}
            </div>
         </div>

         {/* Success/Error feedback */}
         {updateMutation.isSuccess && (
            <p className="text-sm text-green-500">Cập nhật người dùng thành công!</p>
         )}
         {updateMutation.isError && (
            <p className="text-sm text-destructive">
               Lỗi cập nhật:{' '}
               {updateMutation.error instanceof Error
                  ? updateMutation.error.message
                  : 'Vui lòng thử lại'}
            </p>
         )}

         {/* Edit Dialog */}
         {data && (
            <EditUserDialog
               user={data}
               isOpen={isEditOpen}
               onClose={() => setIsEditOpen(false)}
               onSubmit={(updateData) => updateMutation.mutate(updateData)}
               isPending={updateMutation.isPending}
               isCurrentUser={isCurrentUser}
            />
         )}

         {/* Delete Confirm */}
         <ConfirmDialog
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={() => deleteMutation.mutate()}
            title="Xóa người dùng"
            description={`Bạn có chắc muốn xóa người dùng "${data.name ?? data.email}"? Tất cả dữ liệu liên quan (watchlist, sessions) sẽ bị xóa. Hành động này không thể hoàn tác.`}
            isLoading={deleteMutation.isPending}
         />
      </div>
   );
}

function DetailCard({
   icon,
   label,
   value,
}: {
   readonly icon: React.ReactNode;
   readonly label: string;
   readonly value: React.ReactNode;
}) {
   return (
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
         <div className="text-muted-foreground">{icon}</div>
         <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="mt-1 text-sm font-medium">{value}</div>
         </div>
      </div>
   );
}
