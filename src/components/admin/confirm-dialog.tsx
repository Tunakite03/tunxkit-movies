'use client';

import { Button } from '@/components/ui/button';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
   readonly isOpen: boolean;
   readonly onClose: () => void;
   readonly onConfirm: () => void;
   readonly title: string;
   readonly description: string;
   readonly isLoading?: boolean;
   readonly variant?: 'destructive' | 'default';
}

/** Reusable confirmation dialog for destructive actions */
export function ConfirmDialog({
   isOpen,
   onClose,
   onConfirm,
   title,
   description,
   isLoading,
   variant = 'destructive',
}: ConfirmDialogProps) {
   return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                  {variant === 'destructive' && (
                     <AlertTriangle className="h-5 w-5 text-destructive" />
                  )}
                  {title}
               </DialogTitle>
               <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
               <Button variant="outline" onClick={onClose} disabled={isLoading}>
                  Hủy
               </Button>
               <Button
                  variant={variant === 'destructive' ? 'destructive' : 'default'}
                  onClick={onConfirm}
                  disabled={isLoading}
               >
                  {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}
