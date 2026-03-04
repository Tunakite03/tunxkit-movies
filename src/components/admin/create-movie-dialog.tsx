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

interface CreateMovieFormState {
   id: string;
   title: string;
   overview: string;
   releaseDate: string;
   status: string;
   runtime: string;
   voteAverage: string;
}

const INITIAL_FORM: CreateMovieFormState = {
   id: '',
   title: '',
   overview: '',
   releaseDate: '',
   status: 'Released',
   runtime: '0',
   voteAverage: '0',
};

interface CreateMovieDialogProps {
   readonly onSubmit: (data: {
      id: number;
      title: string;
      overview?: string;
      releaseDate?: string;
      status?: string;
      runtime?: number;
      voteAverage?: number;
   }) => void;
   readonly isPending: boolean;
   readonly isSuccess: boolean;
}

/** Dialog for creating a new movie manually */
export function CreateMovieDialog({ onSubmit, isPending, isSuccess }: CreateMovieDialogProps) {
   const [open, setOpen] = useState(false);
   const [form, setForm] = useState<CreateMovieFormState>(INITIAL_FORM);

   const handleChange = useCallback((field: keyof CreateMovieFormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
   }, []);

   const handleSubmit = useCallback(
      (e: FormEvent) => {
         e.preventDefault();
         const id = Number(form.id);
         if (!id || !form.title.trim()) return;

         onSubmit({
            id,
            title: form.title.trim(),
            overview: form.overview || undefined,
            releaseDate: form.releaseDate || undefined,
            status: form.status || undefined,
            runtime: form.runtime ? Number(form.runtime) : undefined,
            voteAverage: form.voteAverage ? Number(form.voteAverage) : undefined,
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
               <Plus className="mr-1 h-4 w-4" /> Thêm phim
            </Button>
         </DialogTrigger>
         <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <form onSubmit={handleSubmit}>
               <DialogHeader>
                  <DialogTitle>Thêm phim mới</DialogTitle>
                  <DialogDescription>
                     Tạo một phim mới bằng cách điền thông tin bên dưới.
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
                        placeholder="TMDB ID hoặc ID tùy chọn"
                        required
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        Tên phim <span className="text-destructive">*</span>
                     </label>
                     <Input
                        value={form.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Nhập tên phim"
                        required
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Ngày phát hành</label>
                     <Input
                        value={form.releaseDate}
                        onChange={(e) => handleChange('releaseDate', e.target.value)}
                        placeholder="YYYY-MM-DD"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Trạng thái</label>
                     <Input
                        value={form.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        placeholder="Released, In Production, ..."
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        Thời lượng (phút)
                     </label>
                     <Input
                        type="number"
                        min={0}
                        value={form.runtime}
                        onChange={(e) => handleChange('runtime', e.target.value)}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Đánh giá (0-10)</label>
                     <Input
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                        value={form.voteAverage}
                        onChange={(e) => handleChange('voteAverage', e.target.value)}
                     />
                  </div>
                  <div className="col-span-full space-y-2">
                     <label className="text-sm font-medium text-foreground">Mô tả</label>
                     <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={form.overview}
                        onChange={(e) => handleChange('overview', e.target.value)}
                        placeholder="Nhập mô tả phim..."
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
                  <Button type="submit" disabled={isPending || !form.id || !form.title.trim()}>
                     {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : (
                        <Plus className="mr-2 h-4 w-4" />
                     )}
                     Tạo phim
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
