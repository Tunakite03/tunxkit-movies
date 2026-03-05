'use client';

import { useState, useCallback, useEffect, type FormEvent } from 'react';
import { Plus, Save, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
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
import type { AdminSeasonItem } from '@/services/admin-dashboard-service';

// ─── Form state ─────────────────────────────────────────────

interface SeasonFormState {
   name: string;
   seasonNumber: string;
   episodeCount: string;
   airDate: string;
}

const INITIAL_FORM: SeasonFormState = {
   name: '',
   seasonNumber: '',
   episodeCount: '0',
   airDate: '',
};

function buildFormFromSeason(season: AdminSeasonItem): SeasonFormState {
   return {
      name: season.name,
      seasonNumber: String(season.seasonNumber),
      episodeCount: String(season.episodeCount),
      airDate: season.airDate ?? '',
   };
}

// ─── Create Season Dialog ───────────────────────────────────

interface CreateSeasonDialogProps {
   readonly mediaTitle: string;
   readonly onSubmit: (data: {
      name: string;
      seasonNumber: number;
      episodeCount: number;
      airDate?: string;
   }) => void;
   readonly isPending: boolean;
   readonly isSuccess: boolean;
}

export function CreateSeasonDialog({
   mediaTitle,
   onSubmit,
   isPending,
   isSuccess,
}: CreateSeasonDialogProps) {
   const [open, setOpen] = useState(false);
   const [form, setForm] = useState<SeasonFormState>(INITIAL_FORM);

   const handleChange = useCallback((field: keyof SeasonFormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
   }, []);

   const handleSubmit = useCallback(
      (e: FormEvent) => {
         e.preventDefault();
         if (!form.name.trim() || !form.seasonNumber) return;

         onSubmit({
            name: form.name.trim(),
            seasonNumber: Number(form.seasonNumber),
            episodeCount: Number(form.episodeCount) || 0,
            airDate: form.airDate || undefined,
         });
      },
      [form, onSubmit],
   );

   if (isSuccess && open) {
      setOpen(false);
      setForm(INITIAL_FORM);
   }

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button size="sm" variant="outline">
               <Plus className="mr-1 h-4 w-4" /> Thêm mùa
            </Button>
         </DialogTrigger>
         <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
               <DialogHeader>
                  <DialogTitle>Thêm mùa mới</DialogTitle>
                  <DialogDescription>Thêm mùa mới cho &quot;{mediaTitle}&quot;.</DialogDescription>
               </DialogHeader>

               <div className="mt-4 grid gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        Tên mùa <span className="text-destructive">*</span>
                     </label>
                     <Input
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="vd: Season 1"
                        required
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                           Số mùa <span className="text-destructive">*</span>
                        </label>
                        <Input
                           type="number"
                           min={1}
                           value={form.seasonNumber}
                           onChange={(e) => handleChange('seasonNumber', e.target.value)}
                           placeholder="1"
                           required
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Số tập</label>
                        <Input
                           type="number"
                           min={0}
                           value={form.episodeCount}
                           onChange={(e) => handleChange('episodeCount', e.target.value)}
                           placeholder="0"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Ngày phát sóng</label>
                     <DatePicker
                        value={form.airDate}
                        onChange={(v) => handleChange('airDate', v)}
                     />
                  </div>
               </div>

               <DialogFooter className="mt-6">
                  <Button type="submit" disabled={isPending}>
                     {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : (
                        <Plus className="mr-2 h-4 w-4" />
                     )}
                     Thêm mùa
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}

// ─── Edit Season Dialog ─────────────────────────────────────

interface EditSeasonDialogProps {
   readonly season: AdminSeasonItem;
   readonly isOpen: boolean;
   readonly onClose: () => void;
   readonly onSubmit: (data: {
      name?: string;
      seasonNumber?: number;
      episodeCount?: number;
      airDate?: string;
   }) => void;
   readonly isPending: boolean;
}

export function EditSeasonDialog({
   season,
   isOpen,
   onClose,
   onSubmit,
   isPending,
}: EditSeasonDialogProps) {
   const [form, setForm] = useState<SeasonFormState>(() => buildFormFromSeason(season));

   useEffect(() => {
      if (isOpen) {
         setForm(buildFormFromSeason(season));
      }
   }, [isOpen, season]);

   const handleChange = useCallback((field: keyof SeasonFormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
   }, []);

   const handleSubmit = useCallback(
      (e: FormEvent) => {
         e.preventDefault();
         if (!form.name.trim() || !form.seasonNumber) return;

         onSubmit({
            name: form.name.trim(),
            seasonNumber: Number(form.seasonNumber),
            episodeCount: Number(form.episodeCount) || 0,
            airDate: form.airDate || undefined,
         });
      },
      [form, onSubmit],
   );

   return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
         <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
               <DialogHeader>
                  <DialogTitle>Chỉnh sửa mùa</DialogTitle>
                  <DialogDescription>
                     Cập nhật thông tin cho &quot;{season.name}&quot;.
                  </DialogDescription>
               </DialogHeader>

               <div className="mt-4 grid gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">
                        Tên mùa <span className="text-destructive">*</span>
                     </label>
                     <Input
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="vd: Season 1"
                        required
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                           Số mùa <span className="text-destructive">*</span>
                        </label>
                        <Input
                           type="number"
                           min={1}
                           value={form.seasonNumber}
                           onChange={(e) => handleChange('seasonNumber', e.target.value)}
                           placeholder="1"
                           required
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Số tập</label>
                        <Input
                           type="number"
                           min={0}
                           value={form.episodeCount}
                           onChange={(e) => handleChange('episodeCount', e.target.value)}
                           placeholder="0"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Ngày phát sóng</label>
                     <DatePicker
                        value={form.airDate}
                        onChange={(v) => handleChange('airDate', v)}
                     />
                  </div>
               </div>

               <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={onClose}>
                     Hủy
                  </Button>
                  <Button type="submit" disabled={isPending}>
                     {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : (
                        <Save className="mr-2 h-4 w-4" />
                     )}
                     Lưu thay đổi
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
