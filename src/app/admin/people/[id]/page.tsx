'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCircle, ArrowLeft, Save, ExternalLink, Loader2, Star, Film, Tv } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { getAdminPersonDetail, updateAdminPerson } from '@/services/admin-dashboard-service';
import type { UpdatePersonData } from '@/services/admin-dashboard-service';
import { useAuthStore } from '@/store/auth-store';
import { IMAGE_SIZES } from '@/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AdminPageHeader } from '@/components/admin/admin-shared';

/** Person edit form fields */
interface PersonFormState {
   name: string;
   biography: string;
   birthday: string;
   deathday: string;
   placeOfBirth: string;
   profilePath: string;
   knownForDepartment: string;
   gender: string;
}

function buildInitialForm(data: {
   name: string;
   biography: string;
   birthday: string | null;
   deathday: string | null;
   placeOfBirth: string | null;
   profilePath: string | null;
   knownForDepartment: string;
   gender: number;
}): PersonFormState {
   return {
      name: data.name,
      biography: data.biography ?? '',
      birthday: data.birthday ?? '',
      deathday: data.deathday ?? '',
      placeOfBirth: data.placeOfBirth ?? '',
      profilePath: data.profilePath ?? '',
      knownForDepartment: data.knownForDepartment ?? '',
      gender: String(data.gender),
   };
}

function buildUpdatePayload(form: PersonFormState): UpdatePersonData {
   return {
      name: form.name.trim() || undefined,
      biography: form.biography || undefined,
      birthday: form.birthday || undefined,
      deathday: form.deathday || undefined,
      placeOfBirth: form.placeOfBirth || undefined,
      profilePath: form.profilePath || undefined,
      knownForDepartment: form.knownForDepartment || undefined,
      gender: form.gender ? Number(form.gender) : undefined,
   };
}

export default function AdminPersonDetailPage() {
   const params = useParams();
   const router = useRouter();
   const personId = Number(params.id);
   const { token } = useAuthStore();
   const queryClient = useQueryClient();

   const [form, setForm] = useState<PersonFormState | null>(null);

   const { data, isLoading } = useQuery({
      queryKey: ['admin-person-detail', personId],
      queryFn: () => getAdminPersonDetail(personId, token as string),
      enabled: !!token && !isNaN(personId),
   });

   if (data && form === null) {
      setForm(buildInitialForm(data));
   }

   const updateMutation = useMutation({
      mutationFn: (payload: UpdatePersonData) =>
         updateAdminPerson(personId, payload, token as string),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['admin-person-detail', personId] });
         queryClient.invalidateQueries({ queryKey: ['admin-people'] });
      },
   });

   const handleFormChange = useCallback((field: keyof PersonFormState, value: string) => {
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
            <p className="text-center text-muted-foreground">Không tìm thấy diễn viên</p>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <AdminPageHeader
            title={data.name}
            description={`ID: ${data.id} · ${data.knownForDepartment || 'N/A'}`}
            icon={<UserCircle className="h-6 w-6 text-cyan-500" />}
            actions={
               <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.back()}>
                     <ArrowLeft className="mr-1 h-3 w-3" /> Quay lại
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                     <Link href={`/people/${data.id}`} target="_blank">
                        <ExternalLink className="mr-1 h-3 w-3" /> Xem trang
                     </Link>
                  </Button>
               </div>
            }
         />

         {/* Person Header Card */}
         <div className="flex gap-4 rounded-lg border border-border bg-card p-4">
            {data.profilePath ? (
               <Image
                  src={`${IMAGE_SIZES.profile.small}${data.profilePath}`}
                  alt={data.name}
                  width={120}
                  height={180}
                  className="rounded-lg object-cover"
               />
            ) : (
               <div className="flex h-[180px] w-[120px] items-center justify-center rounded-lg bg-muted">
                  <UserCircle className="h-12 w-12 text-muted-foreground" />
               </div>
            )}
            <div className="flex flex-1 flex-col gap-2">
               <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{data.knownForDepartment}</Badge>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                     <Star className="h-3 w-3 text-amber-500" /> {data.popularity.toFixed(1)}{' '}
                     popularity
                  </span>
               </div>
               <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                     <Film className="h-3 w-3" /> {data._count.movieCast} phim lẻ
                  </span>
                  <span className="flex items-center gap-1">
                     <Tv className="h-3 w-3" /> {data._count.tvCast} phim bộ
                  </span>
               </div>
               {data.birthday && (
                  <p className="text-sm text-muted-foreground">
                     Sinh: {data.birthday}
                     {data.deathday && ` · Mất: ${data.deathday}`}
                  </p>
               )}
               {data.placeOfBirth && (
                  <p className="text-sm text-muted-foreground">Nơi sinh: {data.placeOfBirth}</p>
               )}
               {data.biography && (
                  <p className="line-clamp-4 text-sm text-muted-foreground">{data.biography}</p>
               )}
            </div>
         </div>

         {/* Edit Form */}
         {form && (
            <div className="rounded-lg border border-border bg-card p-4">
               <h3 className="mb-4 text-sm font-medium text-foreground">Chỉnh sửa thông tin</h3>
               <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        Tên <span className="text-destructive">*</span>
                     </label>
                     <Input
                        value={form.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        placeholder="Nhập tên diễn viên"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Vai trò chính</label>
                     <Input
                        value={form.knownForDepartment}
                        onChange={(e) => handleFormChange('knownForDepartment', e.target.value)}
                        placeholder="Acting, Directing, ..."
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Ngày sinh</label>
                     <Input
                        value={form.birthday}
                        onChange={(e) => handleFormChange('birthday', e.target.value)}
                        placeholder="YYYY-MM-DD"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Ngày mất</label>
                     <Input
                        value={form.deathday}
                        onChange={(e) => handleFormChange('deathday', e.target.value)}
                        placeholder="YYYY-MM-DD"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Nơi sinh</label>
                     <Input
                        value={form.placeOfBirth}
                        onChange={(e) => handleFormChange('placeOfBirth', e.target.value)}
                        placeholder="Nhập nơi sinh"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Giới tính</label>
                     <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={form.gender}
                        onChange={(e) => handleFormChange('gender', e.target.value)}
                     >
                        <option value="0">Không xác định</option>
                        <option value="1">Nữ</option>
                        <option value="2">Nam</option>
                        <option value="3">Non-binary</option>
                     </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                     <label className="text-sm font-medium text-foreground">
                        Đường dẫn ảnh (TMDB)
                     </label>
                     <Input
                        value={form.profilePath}
                        onChange={(e) => handleFormChange('profilePath', e.target.value)}
                        placeholder="/path/to/profile.jpg"
                     />
                  </div>
                  <div className="col-span-full space-y-2">
                     <label className="text-sm font-medium text-foreground">Tiểu sử</label>
                     <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={form.biography}
                        onChange={(e) => handleFormChange('biography', e.target.value)}
                        placeholder="Nhập tiểu sử..."
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
                  <p className="mt-2 text-sm text-destructive">Lỗi cập nhật. Vui lòng thử lại.</p>
               )}
            </div>
         )}
      </div>
   );
}
