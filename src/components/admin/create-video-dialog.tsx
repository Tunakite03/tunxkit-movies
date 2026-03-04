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

interface CreateVideoFormState {
   key: string;
   name: string;
   site: string;
   type: string;
}

const INITIAL_FORM: CreateVideoFormState = {
   key: '',
   name: '',
   site: 'YouTube',
   type: 'Trailer',
};

interface CreateVideoDialogProps {
   readonly mediaTitle: string;
   readonly onSubmit: (data: {
      key: string;
      name: string;
      site?: string;
      type?: string;
      official?: boolean;
   }) => void;
   readonly isPending: boolean;
   readonly isSuccess: boolean;
}

/** Dialog for adding a video to a movie or TV show */
export function CreateVideoDialog({
   mediaTitle,
   onSubmit,
   isPending,
   isSuccess,
}: CreateVideoDialogProps) {
   const [open, setOpen] = useState(false);
   const [form, setForm] = useState<CreateVideoFormState>(INITIAL_FORM);

   const handleChange = useCallback((field: keyof CreateVideoFormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
   }, []);

   const handleSubmit = useCallback(
      (e: FormEvent) => {
         e.preventDefault();
         if (!form.key.trim() || !form.name.trim()) return;

         onSubmit({
            key: form.key.trim(),
            name: form.name.trim(),
            site: form.site || 'YouTube',
            type: form.type || 'Trailer',
            official: true,
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
            <Button size="sm" variant="outline">
               <Plus className="mr-1 h-4 w-4" /> Thêm video
            </Button>
         </DialogTrigger>
         <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
               <DialogHeader>
                  <DialogTitle>Thêm video</DialogTitle>
                  <DialogDescription>
                     Thêm video mới cho &quot;{mediaTitle}&quot;.
                  </DialogDescription>
               </DialogHeader>

               <div className="mt-4 grid gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        YouTube Key <span className="text-destructive">*</span>
                     </label>
                     <Input
                        value={form.key}
                        onChange={(e) => handleChange('key', e.target.value)}
                        placeholder="vd: dQw4w9WgXcQ"
                        required
                     />
                     <p className="text-xs text-muted-foreground">
                        Phần ID trong URL YouTube (youtube.com/watch?v=...)
                     </p>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        Tên video <span className="text-destructive">*</span>
                     </label>
                     <Input
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Nhập tên video"
                        required
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Nguồn</label>
                        <Input
                           value={form.site}
                           onChange={(e) => handleChange('site', e.target.value)}
                           placeholder="YouTube"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Loại</label>
                        <select
                           className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                           value={form.type}
                           onChange={(e) => handleChange('type', e.target.value)}
                        >
                           <option value="Trailer">Trailer</option>
                           <option value="Teaser">Teaser</option>
                           <option value="Clip">Clip</option>
                           <option value="Behind the Scenes">Phía sau hậu trường</option>
                           <option value="Featurette">Featurette</option>
                        </select>
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
                  <Button
                     type="submit"
                     disabled={isPending || !form.key.trim() || !form.name.trim()}
                  >
                     {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : (
                        <Plus className="mr-2 h-4 w-4" />
                     )}
                     Thêm video
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
