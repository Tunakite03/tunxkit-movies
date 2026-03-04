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

interface CreateTVShowFormState {
   id: string;
   name: string;
   overview: string;
   firstAirDate: string;
   status: string;
   numberOfSeasons: string;
   numberOfEpisodes: string;
   voteAverage: string;
}

const INITIAL_FORM: CreateTVShowFormState = {
   id: '',
   name: '',
   overview: '',
   firstAirDate: '',
   status: 'Returning Series',
   numberOfSeasons: '0',
   numberOfEpisodes: '0',
   voteAverage: '0',
};

interface CreateTVShowDialogProps {
   readonly onSubmit: (data: {
      id: number;
      name: string;
      overview?: string;
      firstAirDate?: string;
      status?: string;
      numberOfSeasons?: number;
      numberOfEpisodes?: number;
      voteAverage?: number;
   }) => void;
   readonly isPending: boolean;
   readonly isSuccess: boolean;
}

/** Dialog for creating a new TV show manually */
export function CreateTVShowDialog({ onSubmit, isPending, isSuccess }: CreateTVShowDialogProps) {
   const [open, setOpen] = useState(false);
   const [form, setForm] = useState<CreateTVShowFormState>(INITIAL_FORM);

   const handleChange = useCallback((field: keyof CreateTVShowFormState, value: string) => {
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
            overview: form.overview || undefined,
            firstAirDate: form.firstAirDate || undefined,
            status: form.status || undefined,
            numberOfSeasons: form.numberOfSeasons ? Number(form.numberOfSeasons) : undefined,
            numberOfEpisodes: form.numberOfEpisodes ? Number(form.numberOfEpisodes) : undefined,
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
               <Plus className="mr-1 h-4 w-4" /> Thêm phim bộ
            </Button>
         </DialogTrigger>
         <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <form onSubmit={handleSubmit}>
               <DialogHeader>
                  <DialogTitle>Thêm phim bộ mới</DialogTitle>
                  <DialogDescription>
                     Tạo một phim bộ mới bằng cách điền thông tin bên dưới.
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
                        Tên phim bộ <span className="text-destructive">*</span>
                     </label>
                     <Input
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Nhập tên phim bộ"
                        required
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Ngày phát sóng</label>
                     <Input
                        value={form.firstAirDate}
                        onChange={(e) => handleChange('firstAirDate', e.target.value)}
                        placeholder="YYYY-MM-DD"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Trạng thái</label>
                     <Input
                        value={form.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        placeholder="Returning Series, Ended, ..."
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Số mùa</label>
                     <Input
                        type="number"
                        min={0}
                        value={form.numberOfSeasons}
                        onChange={(e) => handleChange('numberOfSeasons', e.target.value)}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Số tập</label>
                     <Input
                        type="number"
                        min={0}
                        value={form.numberOfEpisodes}
                        onChange={(e) => handleChange('numberOfEpisodes', e.target.value)}
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
                        placeholder="Nhập mô tả phim bộ..."
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
                     Tạo phim bộ
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
