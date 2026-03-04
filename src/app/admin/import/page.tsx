'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
   Database,
   Download,
   Film,
   Tv,
   Users,
   Tag,
   RefreshCw,
   CheckCircle2,
   AlertCircle,
   PlayCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import {
   getAdminStats,
   importAll,
   importGenres,
   importMovie,
   importTV,
   type ImportResponse,
} from '@/services/admin-dashboard-service';
import { useAuthStore } from '@/store/auth-store';

/** Optional Toast system (if project uses Sonner/Toaster) - we'll build a custom simple one here or use simple alerts */

export default function AdminPage() {
   const { token } = useAuthStore();
   const queryClient = useQueryClient();

   const [importAllPages, setImportAllPages] = useState<number>(5);
   const [singleId, setSingleId] = useState<string>('');
   const [singleType, setSingleType] = useState<'movie' | 'tv'>('movie');

   const [notification, setNotification] = useState<{
      message: string;
      type: 'success' | 'error';
   } | null>(null);

   // --- Queries ---
   const {
      data: stats,
      isLoading: statsLoading,
      refetch: refetchStats,
   } = useQuery({
      queryKey: ['admin-stats'],
      queryFn: () => getAdminStats(token as string),
      enabled: !!token,
   });

   // --- Helper to show notification ---
   const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 5000); // clear after 5s
   };

   // --- Mutations ---
   const mutationOptions = {
      onSuccess: (data: ImportResponse) => {
         const msg =
            data.message ||
            `Nhập dữ liệu thành công! 
            ${data.movies ? `Movies: ${data.movies} | ` : ''}
            ${data.tvShows ? `TV: ${data.tvShows} | ` : ''}
            ${data.people ? `People: ${data.people} | ` : ''}
            ${data.peopleImported ? `People Imported: ${data.peopleImported}` : ''}`;

         showNotification(msg, 'success');
         // Refetch stats immediately
         queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      },
      onError: (err: Error) => {
         showNotification(err?.message || 'Có lỗi xảy ra', 'error');
      },
   };

   const importAllMutation = useMutation({
      mutationFn: () => importAll(importAllPages, token as string),
      ...mutationOptions,
   });

   const importGenresMutation = useMutation({
      mutationFn: () => importGenres(token as string),
      ...mutationOptions,
   });

   const importSingleMovieMutation = useMutation({
      mutationFn: () => importMovie(Number(singleId), token as string),
      ...mutationOptions,
   });

   const importSingleTVMutation = useMutation({
      mutationFn: () => importTV(Number(singleId), token as string),
      ...mutationOptions,
   });

   // --- Handlers ---
   const handleImportSingle = () => {
      if (!singleId || isNaN(Number(singleId))) {
         showNotification('Vui lòng nhập ID hợp lệ (số)', 'error');
         return;
      }
      if (singleType === 'movie') importSingleMovieMutation.mutate();
      else importSingleTVMutation.mutate();
   };

   const isAnyImporting =
      importAllMutation.isPending ||
      importGenresMutation.isPending ||
      importSingleMovieMutation.isPending ||
      importSingleTVMutation.isPending;

   // --- Render ---
   return (
      <div className="relative flex flex-col gap-8">
         {/* Simple Custom Notification Popup */}
         <AnimatePresence>
            {notification && (
               <motion.div
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg p-4 shadow-lg border ${
                     notification.type === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-500'
                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                  } backdrop-blur-md`}
               >
                  {notification.type === 'success' ? (
                     <CheckCircle2 className="h-5 w-5" />
                  ) : (
                     <AlertCircle className="h-5 w-5" />
                  )}
                  <p className="text-sm font-medium whitespace-pre-wrap">{notification.message}</p>
               </motion.div>
            )}
         </AnimatePresence>

         {/* STATS GRID */}
         <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
               title="Movies"
               value={stats?.movies}
               icon={<Film className="h-5 w-5 text-blue-500" />}
               loading={statsLoading}
            />
            <StatCard
               title="TV Shows"
               value={stats?.tvShows}
               icon={<Tv className="h-5 w-5 text-purple-500" />}
               loading={statsLoading}
            />
            <StatCard
               title="People"
               value={stats?.people}
               icon={<Users className="h-5 w-5 text-green-500" />}
               loading={statsLoading}
            />
            <StatCard
               title="Genres"
               value={stats?.genres}
               icon={<Tag className="h-5 w-5 text-amber-500" />}
               loading={statsLoading}
            />
            <StatCard
               title="Movie Videos"
               value={stats?.videos}
               icon={<PlayCircle className="h-5 w-5 text-rose-500" />}
               loading={statsLoading}
            />
            <StatCard
               title="TV Videos"
               value={stats?.tvVideos}
               icon={<PlayCircle className="h-5 w-5 text-indigo-500" />}
               loading={statsLoading}
            />
         </section>

         {/* ACTION PANELS */}
         <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* BULK IMPORT PANEL */}
            <motion.section
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex flex-col rounded-xl border border-border/50 bg-card p-6 shadow-sm"
            >
               <h2 className="flex items-center gap-2 text-xl font-semibold text-card-foreground">
                  <Database className="h-5 w-5 text-primary" />
                  Nhập dữ liệu số lượng lớn (TMDB)
               </h2>
               <p className="mt-2 text-sm text-muted-foreground">
                  Kéo tự động các danh sách phim nổi bật, tv shows nổi bật, và thông tin diễn viên
                  liên quan, sau đó lưu trực tiếp vào cơ sở dữ liệu. Cài đặt số lượng trang để giới
                  hạn (Mặc định: 5 trang/thể loại).
               </p>

               <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end">
                  <div className="flex flex-col gap-2">
                     <label htmlFor="pages" className="text-sm font-medium text-foreground">
                        Số lượng trang cần lấy (Pages)
                     </label>
                     <input
                        id="pages"
                        type="number"
                        min={1}
                        max={100}
                        value={importAllPages}
                        onChange={(e) => setImportAllPages(Number(e.target.value))}
                        className="w-full cursor-not-allowed rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-32"
                        disabled={isAnyImporting}
                     />
                  </div>

                  <div className="flex items-center gap-3">
                     <button
                        onClick={() => importAllMutation.mutate()}
                        disabled={isAnyImporting}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                     >
                        {importAllMutation.isPending ? (
                           <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                           <Download className="h-4 w-4" />
                        )}
                        Import Tất Cả
                     </button>
                     <button
                        onClick={() => importGenresMutation.mutate()}
                        disabled={isAnyImporting}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                     >
                        {importGenresMutation.isPending ? (
                           <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                           <RefreshCw className="h-4 w-4" />
                        )}
                        Chỉ Cập nhật Genres
                     </button>
                  </div>
               </div>
            </motion.section>

            {/* SINGLE IMPORT PANEL */}
            <motion.section
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="flex flex-col rounded-xl border border-border/50 bg-card p-6 shadow-sm"
            >
               <h2 className="flex items-center gap-2 text-xl font-semibold text-card-foreground">
                  <Film className="h-5 w-5 text-primary" />
                  Nhập phim cụ thể qua TMDB ID
               </h2>
               <p className="mt-2 text-sm text-muted-foreground">
                  Sao chép ID từ The Movie Database (ví dụ: Fight Club là 550) và dán vào đây để kéo
                  chi tiết phim hoặc TV show cùng với diễn viên của bộ phim đó.
               </p>

               <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end">
                  <div className="flex flex-col gap-2 flex-1">
                     <label htmlFor="singleId" className="text-sm font-medium text-foreground">
                        TMDB ID
                     </label>
                     <div className="flex gap-2 relative">
                        <select
                           value={singleType}
                           onChange={(e) => setSingleType(e.target.value as 'movie' | 'tv')}
                           disabled={isAnyImporting}
                           className="w-24 rounded-md border border-input bg-background pl-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        >
                           <option value="movie">Movie</option>
                           <option value="tv">TV</option>
                        </select>
                        <input
                           id="singleId"
                           type="text"
                           placeholder="Ví dụ: 550"
                           value={singleId}
                           onChange={(e) => setSingleId(e.target.value)}
                           className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                           disabled={isAnyImporting}
                        />
                     </div>
                  </div>

                  <button
                     onClick={handleImportSingle}
                     disabled={isAnyImporting || !singleId}
                     className="inline-flex items-center justify-center gap-2 rounded-md bg-secondary px-8 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                     {importSingleMovieMutation.isPending || importSingleTVMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                     ) : (
                        <Download className="h-4 w-4" />
                     )}
                     Import
                  </button>
               </div>
            </motion.section>
         </div>

         <div className="text-center mt-4">
            <button
               onClick={() => refetchStats()}
               disabled={statsLoading}
               className="inline-flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            >
               <RefreshCw className={`h-3 w-3 ${statsLoading ? 'animate-spin' : ''}`} />
               Làm mới thống kê
            </button>
         </div>
      </div>
   );
}

function StatCard({
   title,
   value,
   icon,
   loading,
}: {
   title: string;
   value?: number;
   icon: React.ReactNode;
   loading: boolean;
}) {
   return (
      <motion.div
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="flex flex-col gap-2 rounded-xl border border-border/50 bg-card p-4 shadow-sm"
      >
         <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
         </div>
         <div className="mt-2">
            {loading ? (
               <div className="h-8 rounded animate-pulse bg-muted w-16" />
            ) : (
               <span className="text-3xl font-bold tracking-tight text-foreground">
                  {value?.toLocaleString() ?? 0}
               </span>
            )}
         </div>
      </motion.div>
   );
}
