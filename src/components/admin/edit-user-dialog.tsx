'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { Loader2, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import type { AdminUserDetail, UpdateUserData } from '@/services/admin-dashboard-service';

interface EditUserFormState {
   name: string;
   email: string;
   image: string;
   role: 'USER' | 'ADMIN';
}

interface EditUserDialogProps {
   readonly user: AdminUserDetail;
   readonly isOpen: boolean;
   readonly onClose: () => void;
   readonly onSubmit: (data: UpdateUserData) => void;
   readonly isPending: boolean;
   readonly isCurrentUser: boolean;
}

function buildFormState(user: AdminUserDetail): EditUserFormState {
   return {
      name: user.name ?? '',
      email: user.email,
      image: user.image ?? '',
      role: (user.role === 'ADMIN' ? 'ADMIN' : 'USER') as 'USER' | 'ADMIN',
   };
}

export function EditUserDialog({
   user,
   isOpen,
   onClose,
   onSubmit,
   isPending,
   isCurrentUser,
}: EditUserDialogProps) {
   const [form, setForm] = useState<EditUserFormState>(() => buildFormState(user));

   const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
   if (isOpen !== prevIsOpen) {
      setPrevIsOpen(isOpen);
      if (isOpen) {
         setForm(buildFormState(user));
      }
   }

   const handleChange = useCallback((field: keyof EditUserFormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
   }, []);

   const handleSubmit = useCallback(
      (e: FormEvent) => {
         e.preventDefault();
         if (!form.email.trim()) return;

         const data: UpdateUserData = {};
         if (form.name !== (user.name ?? '')) {
            (data as Record<string, unknown>).name = form.name || undefined;
         }
         if (form.email !== user.email) {
            (data as Record<string, unknown>).email = form.email;
         }
         if (form.image !== (user.image ?? '')) {
            (data as Record<string, unknown>).image = form.image || undefined;
         }
         if (!isCurrentUser && form.role !== user.role) {
            (data as Record<string, unknown>).role = form.role;
         }

         onSubmit(data);
      },
      [form, user, isCurrentUser, onSubmit],
   );

   return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
         <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <form onSubmit={handleSubmit}>
               <DialogHeader>
                  <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
                  <DialogDescription>
                     Cập nhật thông tin tài khoản của{' '}
                     <span className="font-medium">{user.name ?? user.email}</span>
                  </DialogDescription>
               </DialogHeader>

               <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Tên</label>
                     <Input
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Nhập tên người dùng"
                        maxLength={200}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        Email <span className="text-destructive">*</span>
                     </label>
                     <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="Nhập email"
                        required
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        Ảnh đại diện (URL)
                     </label>
                     <Input
                        value={form.image}
                        onChange={(e) => handleChange('image', e.target.value)}
                        placeholder="https://..."
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Vai trò</label>
                     <Select
                        value={form.role}
                        onValueChange={(value) => handleChange('role', value)}
                        disabled={isCurrentUser}
                     >
                        <SelectTrigger>
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="USER">User</SelectItem>
                           <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                     </Select>
                     {isCurrentUser && (
                        <p className="text-xs text-muted-foreground">
                           Không thể thay đổi vai trò của chính mình
                        </p>
                     )}
                  </div>
               </div>

               <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                     Hủy
                  </Button>
                  <Button type="submit" disabled={isPending || !form.email.trim()}>
                     {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : (
                        <Pencil className="mr-2 h-4 w-4" />
                     )}
                     Lưu thay đổi
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
