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

interface CreateGenreFormState {
   id: string;
   name: string;
   type: 'movie' | 'tv';
}

const INITIAL_FORM: CreateGenreFormState = {
   id: '',
   name: '',
   type: 'movie',
};

interface CreateGenreDialogProps {
   readonly onSubmit: (data: { id: number; name: string; type: 'movie' | 'tv' }) => void;
   readonly isPending: boolean;
   readonly isSuccess: boolean;
}

/** Dialog for creating a new genre manually */
export function CreateGenreDialog({ onSubmit, isPending, isSuccess }: CreateGenreDialogProps) {
   const [open, setOpen] = useState(false);
   const [form, setForm] = useState<CreateGenreFormState>(INITIAL_FORM);

   const handleSubmit = useCallback(
      (e: FormEvent) => {
         e.preventDefault();
         const id = Number(form.id);
         if (!id || !form.name.trim()) return;

         onSubmit({ id, name: form.name.trim(), type: form.type });
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
               <Plus className="mr-1 h-4 w-4" /> Thêm thể loại
            </Button>
         </DialogTrigger>
         <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
               <DialogHeader>
                  <DialogTitle>Thêm thể loại mới</DialogTitle>
                  <DialogDescription>
                     Tạo một thể loại mới cho phim lẻ hoặc phim bộ.
                  </DialogDescription>
               </DialogHeader>

               <div className="mt-4 grid gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        ID <span className="text-destructive">*</span>
                     </label>
                     <Input
                        type="number"
                        min={1}
                        value={form.id}
                        onChange={(e) => setForm((prev) => ({ ...prev, id: e.target.value }))}
                        placeholder="TMDB Genre ID hoặc ID tùy chọn"
                        required
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        Tên thể loại <span className="text-destructive">*</span>
                     </label>
                     <Input
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Nhập tên thể loại"
                        required
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        Loại <span className="text-destructive">*</span>
                     </label>
                     <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm">
                           <input
                              type="radio"
                              name="genre-type"
                              value="movie"
                              checked={form.type === 'movie'}
                              onChange={() => setForm((prev) => ({ ...prev, type: 'movie' }))}
                              className="accent-primary"
                           />
                           Phim lẻ
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                           <input
                              type="radio"
                              name="genre-type"
                              value="tv"
                              checked={form.type === 'tv'}
                              onChange={() => setForm((prev) => ({ ...prev, type: 'tv' }))}
                              className="accent-primary"
                           />
                           Phim bộ
                        </label>
                     </div>
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
                     Tạo thể loại
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
