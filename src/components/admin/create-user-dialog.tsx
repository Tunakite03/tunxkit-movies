'use client';

import { useState, useCallback, useEffect, type FormEvent } from 'react';
import { Plus, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/components/ui/dialog';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';

/** RFC 5322 simplified - local part @ domain with TLD */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string): boolean {
   const trimmed = value.trim();
   if (!trimmed) return false;
   return EMAIL_REGEX.test(trimmed);
}

interface CreateUserFormState {
   email: string;
   password: string;
   name: string;
   role: 'USER' | 'ADMIN';
}

const INITIAL_FORM: CreateUserFormState = {
   email: '',
   password: '',
   name: '',
   role: 'USER',
};

interface CreateUserDialogProps {
   readonly onSubmit: (data: {
      email: string;
      password: string;
      name?: string;
      role?: 'USER' | 'ADMIN';
   }) => void;
   readonly isPending: boolean;
   readonly isSuccess: boolean;
   readonly onSuccessHandled?: () => void;
}

export function CreateUserDialog({
   onSubmit,
   isPending,
   isSuccess,
   onSuccessHandled,
}: CreateUserDialogProps) {
   const [open, setOpen] = useState(false);
   const [form, setForm] = useState<CreateUserFormState>(INITIAL_FORM);
   const [emailError, setEmailError] = useState<string | null>(null);
   const [emailTouched, setEmailTouched] = useState(false);

   const handleChange = useCallback((field: keyof CreateUserFormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (field === 'email') {
         setEmailError(null);
      }
   }, []);

   const validateEmail = useCallback((value: string): string | null => {
      const trimmed = value.trim();
      if (!trimmed) return 'Email không được để trống';
      if (!isValidEmail(trimmed)) return 'Email không hợp lệ (ví dụ: user@example.com)';
      return null;
   }, []);

   const handleEmailBlur = useCallback(() => {
      setEmailTouched(true);
      setEmailError(validateEmail(form.email));
   }, [form.email, validateEmail]);

   useEffect(() => {
      if (isSuccess && open) {
         setOpen(false);
         setForm(INITIAL_FORM);
         setEmailError(null);
         setEmailTouched(false);
         onSuccessHandled?.();
      }
   }, [isSuccess, open, onSuccessHandled]);

   const handleSubmit = useCallback(
      (e: FormEvent) => {
         e.preventDefault();

         const emailErr = validateEmail(form.email);
         setEmailTouched(true);
         setEmailError(emailErr);

         if (emailErr || !form.password.trim()) return;
         if (form.password.length < 8) return;

         onSubmit({
            email: form.email.trim(),
            password: form.password,
            name: form.name.trim() || undefined,
            role: form.role,
         });
      },
      [form, onSubmit, validateEmail],
   );

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button size="sm">
               <Plus className="mr-1 h-4 w-4" /> Thêm người dùng
            </Button>
         </DialogTrigger>
         <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <form onSubmit={handleSubmit}>
               <DialogHeader>
                  <DialogTitle>Thêm người dùng mới</DialogTitle>
                  <DialogDescription>
                     Tạo tài khoản người dùng mới bằng cách điền thông tin bên dưới.
                  </DialogDescription>
               </DialogHeader>

               <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        Email <span className="text-destructive">*</span>
                     </label>
                     <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={handleEmailBlur}
                        placeholder="user@example.com"
                        required
                        className={emailError ? 'border-destructive' : ''}
                        aria-invalid={!!emailError}
                        aria-describedby={emailError ? 'email-error' : undefined}
                     />
                     {emailError && (
                        <p id="email-error" className="text-sm text-destructive">
                           {emailError}
                        </p>
                     )}
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        Mật khẩu <span className="text-destructive">*</span>
                     </label>
                     <Input
                        type="password"
                        value={form.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder="Tối thiểu 8 ký tự"
                        minLength={8}
                        maxLength={100}
                        required
                     />
                  </div>
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
                     <label className="text-sm font-medium text-foreground">Vai trò</label>
                     <Select
                        value={form.role}
                        onValueChange={(value) => handleChange('role', value)}
                     >
                        <SelectTrigger>
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="USER">User</SelectItem>
                           <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               <DialogFooter className="mt-6">
                  <Button
                     type="button"
                     variant="outline"
                     onClick={() => setOpen(false)}
                     disabled={isPending}
                  >
                     Hủy
                  </Button>
                  <Button
                     type="submit"
                     disabled={
                        isPending ||
                        !form.email.trim() ||
                        form.password.length < 8 ||
                        !!validateEmail(form.email)
                     }
                  >
                     {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : (
                        <Plus className="mr-2 h-4 w-4" />
                     )}
                     Tạo người dùng
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
