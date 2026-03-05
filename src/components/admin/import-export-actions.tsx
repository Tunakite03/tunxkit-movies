'use client';

import { useState, useCallback, useRef } from 'react';
import { Download, Upload, Loader2, CheckCircle2, AlertCircle, FileUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/components/ui/dialog';
import type { CsvImportResult } from '@/services/admin-dashboard-service';

type ImportMode = 'skip' | 'upsert';

interface ImportExportActionsProps {
   readonly entityLabel: string;
   readonly onExport: () => Promise<void>;
   readonly onImport: (file: File, mode: ImportMode) => Promise<CsvImportResult>;
   readonly sampleCsvUrl?: string;
}

/** Export button + Import dialog for CSV operations */
export function ImportExportActions({
   entityLabel,
   onExport,
   onImport,
   sampleCsvUrl,
}: ImportExportActionsProps) {
   const [isExporting, setIsExporting] = useState(false);
   const [importOpen, setImportOpen] = useState(false);
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [mode, setMode] = useState<ImportMode>('skip');
   const [isImporting, setIsImporting] = useState(false);
   const [result, setResult] = useState<CsvImportResult | null>(null);
   const [error, setError] = useState<string | null>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const handleExport = useCallback(async () => {
      setIsExporting(true);
      try {
         await onExport();
      } catch {
         // Export triggers download directly; errors are rare
      } finally {
         setIsExporting(false);
      }
   }, [onExport]);

   const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setSelectedFile(file);
      setResult(null);
      setError(null);
   }, []);

   const handleImport = useCallback(async () => {
      if (!selectedFile) return;
      setIsImporting(true);
      setError(null);
      setResult(null);

      try {
         const importResult = await onImport(selectedFile, mode);
         setResult(importResult);
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Import failed');
      } finally {
         setIsImporting(false);
      }
   }, [selectedFile, mode, onImport]);

   const resetDialog = useCallback(() => {
      setSelectedFile(null);
      setResult(null);
      setError(null);
      setIsImporting(false);
      setMode('skip');
      if (fileInputRef.current) fileInputRef.current.value = '';
   }, []);

   const handleOpenChange = useCallback(
      (open: boolean) => {
         setImportOpen(open);
         if (!open) resetDialog();
      },
      [resetDialog],
   );

   return (
      <>
         <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
               <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
               <Download className="mr-1 h-4 w-4" />
            )}
            Export CSV
         </Button>

         <Dialog open={importOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
               <Button variant="outline" size="sm">
                  <Upload className="mr-1 h-4 w-4" />
                  Import CSV
               </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
               <DialogHeader>
                  <DialogTitle>Import {entityLabel}</DialogTitle>
                  <DialogDescription>
                     Tải lên file CSV để import {entityLabel.toLowerCase()}. File cần có header đúng
                     định dạng.{' '}
                     {sampleCsvUrl && (
                        <a
                           href={sampleCsvUrl}
                           download
                           className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
                        >
                           <Download className="h-3 w-3" />
                           Tải file CSV mẫu
                        </a>
                     )}
                  </DialogDescription>
               </DialogHeader>

               <div className="mt-4 space-y-4">
                  {/* File picker */}
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">File CSV</label>
                     <div
                        className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border px-4 py-3 transition-colors hover:border-primary/50 hover:bg-muted/50"
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                     >
                        <FileUp className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                           {selectedFile ? selectedFile.name : 'Chọn file .csv'}
                        </span>
                        <input
                           ref={fileInputRef}
                           type="file"
                           accept=".csv,text/csv"
                           onChange={handleFileChange}
                           className="hidden"
                        />
                     </div>
                  </div>

                  {/* Import mode */}
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Khi trùng ID</label>
                     <div className="flex gap-2">
                        <Button
                           type="button"
                           variant={mode === 'skip' ? 'default' : 'outline'}
                           size="sm"
                           onClick={() => setMode('skip')}
                        >
                           Bỏ qua
                        </Button>
                        <Button
                           type="button"
                           variant={mode === 'upsert' ? 'default' : 'outline'}
                           size="sm"
                           onClick={() => setMode('upsert')}
                        >
                           Ghi đè
                        </Button>
                     </div>
                     <p className="text-xs text-muted-foreground">
                        {mode === 'skip'
                           ? 'Các mục đã tồn tại sẽ được bỏ qua, chỉ thêm mới.'
                           : 'Các mục đã tồn tại sẽ được cập nhật dữ liệu từ CSV.'}
                     </p>
                  </div>

                  {/* Result */}
                  {result && <ImportResultSummary result={result} />}

                  {/* Error */}
                  {error && (
                     <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{error}</span>
                     </div>
                  )}
               </div>

               <DialogFooter className="mt-6">
                  <Button
                     type="button"
                     variant="outline"
                     onClick={() => handleOpenChange(false)}
                     disabled={isImporting}
                  >
                     {result ? 'Đóng' : 'Hủy'}
                  </Button>
                  {!result && (
                     <Button onClick={handleImport} disabled={!selectedFile || isImporting}>
                        {isImporting ? (
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                           <Upload className="mr-2 h-4 w-4" />
                        )}
                        Import
                     </Button>
                  )}
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </>
   );
}

function ImportResultSummary({ result }: { readonly result: CsvImportResult }) {
   const total = result.created + result.updated + result.skipped + result.failed;

   return (
      <div className="space-y-3 rounded-md border border-border bg-muted/30 p-4">
         <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Import hoàn tất ({total} dòng)
         </div>

         <div className="grid grid-cols-2 gap-2 text-sm">
            <StatItem label="Tạo mới" value={result.created} className="text-green-500" />
            <StatItem label="Cập nhật" value={result.updated} className="text-blue-500" />
            <StatItem label="Bỏ qua" value={result.skipped} className="text-muted-foreground" />
            <StatItem label="Lỗi" value={result.failed} className="text-destructive" />
         </div>

         {result.errors.length > 0 && (
            <div className="space-y-1">
               <p className="text-xs font-medium text-destructive">
                  Chi tiết lỗi ({result.errors.length}):
               </p>
               <div className="max-h-32 overflow-y-auto rounded bg-background p-2">
                  {result.errors.map((err, i) => (
                     <p key={i} className="text-xs text-muted-foreground">
                        {err}
                     </p>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
}

function StatItem({
   label,
   value,
   className,
}: {
   readonly label: string;
   readonly value: number;
   readonly className: string;
}) {
   return (
      <div className="flex items-center justify-between rounded bg-background px-2 py-1">
         <span className="text-muted-foreground">{label}</span>
         <span className={`font-mono font-medium ${className}`}>{value}</span>
      </div>
   );
}
