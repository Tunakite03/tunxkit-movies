'use client';

import { useState, useCallback, type FormEvent } from 'react';
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

interface CreatePersonFormState {
   id: string;
   name: string;
   biography: string;
   birthday: string;
   placeOfBirth: string;
   knownForDepartment: string;
   gender: string;
}

const INITIAL_FORM: CreatePersonFormState = {
   id: '',
   name: '',
   biography: '',
   birthday: '',
   placeOfBirth: '',
   knownForDepartment: 'Acting',
   gender: '0',
};

interface CreatePersonDialogProps {
   readonly onSubmit: (data: {
      id: number;
      name: string;
      biography?: string;
      birthday?: string;
      placeOfBirth?: string;
      knownForDepartment?: string;
      gender?: number;
   }) => void;
   readonly isPending: boolean;
   readonly isSuccess: boolean;
}

/** Dialog for creating a new person manually */
export function CreatePersonDialog({ onSubmit, isPending, isSuccess }: CreatePersonDialogProps) {
   const [open, setOpen] = useState(false);
   const [form, setForm] = useState<CreatePersonFormState>(INITIAL_FORM);

   const handleChange = useCallback((field: keyof CreatePersonFormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
   }, []);

   const handleSubmit = useCallback(
      (e: FormEvent) => {
         e.preventDefault();
         const id = Number(form.id);
         if (!id || !form.name.trim()) return;

         onSubmit({
            id,
            name: form.name.trim(),
            biography: form.biography || undefined,
            birthday: form.birthday || undefined,
            placeOfBirth: form.placeOfBirth || undefined,
            knownForDepartment: form.knownForDepartment || undefined,
            gender: form.gender ? Number(form.gender) : undefined,
         });
      },
      [form, onSubmit],
   );

   // Reset form and close on success
   if (isSuccess && open) {
      setOpen(false);
      setForm(INITIAL_FORM);
   }

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button size="sm">
               <Plus className="mr-1 h-4 w-4" /> Thêm diễn viên
            </Button>
         </DialogTrigger>
         <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <form onSubmit={handleSubmit}>
               <DialogHeader>
                  <DialogTitle>Thêm diễn viên mới</DialogTitle>
                  <DialogDescription>
                     Tạo một diễn viên/người nổi tiếng mới bằng cách điền thông tin bên dưới.
                  </DialogDescription>
               </DialogHeader>

               <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        ID <span className="text-destructive">*</span>
                     </label>
                     <Input
                        type="number"
                        min={1}
                        value={form.id}
                        onChange={(e) => handleChange('id', e.target.value)}
                        placeholder="TMDB Person ID"
                        required
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        Tên <span className="text-destructive">*</span>
                     </label>
                     <Input
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Nhập tên diễn viên"
                        required
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Ngày sinh</label>
                     <Input
                        value={form.birthday}
                        onChange={(e) => handleChange('birthday', e.target.value)}
                        placeholder="YYYY-MM-DD"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Vai trò chính</label>
                     <Input
                        value={form.knownForDepartment}
                        onChange={(e) => handleChange('knownForDepartment', e.target.value)}
                        placeholder="Acting, Directing, ..."
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Nơi sinh</label>
                     <Input
                        value={form.placeOfBirth}
                        onChange={(e) => handleChange('placeOfBirth', e.target.value)}
                        placeholder="Nhập nơi sinh"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Giới tính</label>
                     <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={form.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                     >
                        <option value="0">Không xác định</option>
                        <option value="1">Nữ</option>
                        <option value="2">Nam</option>
                        <option value="3">Non-binary</option>
                     </select>
                  </div>
                  <div className="col-span-full space-y-2">
                     <label className="text-sm font-medium text-foreground">Tiểu sử</label>
                     <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={form.biography}
                        onChange={(e) => handleChange('biography', e.target.value)}
                        placeholder="Nhập tiểu sử..."
                     />
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
                  <Button type="submit" disabled={isPending || !form.id || !form.name.trim()}>
                     {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : (
                        <Plus className="mr-2 h-4 w-4" />
                     )}
                     Tạo diễn viên
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
