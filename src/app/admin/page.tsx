'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
   Film,
   Tv,
   Users,
   Tag,
   PlayCircle,
   UserCircle,
   Heart,
   Download,
   Star,
   TrendingUp,
   BarChart3,
   Zap,
   Wifi,
   Plus,
   Radio,
   Activity,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

import { getDashboardStats } from '@/services/admin-dashboard-service';
import type {
   AdminMovieItem,
   AdminTVShowItem,
   AdminUser,
} from '@/services/admin-dashboard-service';
import { useAuthStore } from '@/store/auth-store';
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
   StatCard,
   QuickActionCard,
   ProgressBar,
   SectionHeader,
   DashboardCard,
} from '@/components/admin/dashboard-widgets';
import { QuickAddSourceDialog } from '@/components/admin/quick-add-source-dialog';

// ─── TMDB image helper ──────────────────────────────────────

const TMDB_IMG = 'https://image.tmdb.org/t/p/w92';

// ─── Stat card config ───────────────────────────────────────

const STAT_COLOR_MAP = {
   movies: { iconColor: 'text-blue-500', iconBg: 'bg-blue-500/10' },
   tvShows: { iconColor: 'text-purple-500', iconBg: 'bg-purple-500/10' },
   users: { iconColor: 'text-green-500', iconBg: 'bg-green-500/10' },
   people: { iconColor: 'text-cyan-500', iconBg: 'bg-cyan-500/10' },
   genres: { iconColor: 'text-amber-500', iconBg: 'bg-amber-500/10' },
   movieVideos: { iconColor: 'text-rose-500', iconBg: 'bg-rose-500/10' },
   tvVideos: { iconColor: 'text-indigo-500', iconBg: 'bg-indigo-500/10' },
   watchlist: { iconColor: 'text-pink-500', iconBg: 'bg-pink-500/10' },
   videoSources: { iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10' },
} as const;

// ─── Status color mapping ───────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
   Released: 'bg-green-500',
   'Returning Series': 'bg-blue-500',
   Ended: 'bg-muted-foreground',
   Canceled: 'bg-destructive',
   'In Production': 'bg-amber-500',
   Planned: 'bg-cyan-500',
   'Post Production': 'bg-purple-500',
   Rumored: 'bg-muted-foreground/50',
};

const GENRE_BAR_COLORS = [
   'bg-blue-500',
   'bg-purple-500',
   'bg-green-500',
   'bg-amber-500',
   'bg-rose-500',
   'bg-cyan-500',
   'bg-indigo-500',
   'bg-pink-500',
];

function getStatusColor(status: string): string {
   return STATUS_COLORS[status] ?? 'bg-muted-foreground';
}

// ─── Sub-components ─────────────────────────────────────────

function WelcomeHeader({ userName }: { readonly userName: string | null }) {
   const greeting = getGreeting();

   return (
      <motion.div
         initial={{ opacity: 0, y: -10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.4 }}
         className="relative overflow-hidden rounded-xl border border-border bg-linear-to-r from-primary/5 via-card to-primary/5 p-6"
      >
         {/* Decorative gradient blob */}
         <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
         <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-purple-500/5 blur-3xl" />

         <div className="relative flex items-center justify-between">
            <div className="space-y-1">
               <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {greeting}, {userName ?? 'Admin'} 👋
               </h1>
               <p className="text-sm text-muted-foreground">Tổng quan hệ thống quản trị</p>
            </div>
            <Badge
               variant="outline"
               className="hidden border-primary/20 bg-primary/5 text-primary sm:flex"
            >
               {new Date().toLocaleDateString('vi-VN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
               })}
            </Badge>
         </div>
      </motion.div>
   );
}

function getGreeting(): string {
   const hour = new Date().getHours();
   if (hour < 12) return 'Chào buổi sáng';
   if (hour < 18) return 'Chào buổi chiều';
   return 'Chào buổi tối';
}

// ─── Video Source Summary Cards ─────────────────────────────

function VideoSourceSummary({
   videoSources,
   activeVideoSources,
   isLoading,
}: {
   readonly videoSources?: number;
   readonly activeVideoSources?: number;
   readonly isLoading: boolean;
}) {
   const inactive = (videoSources ?? 0) - (activeVideoSources ?? 0);

   return (
      <DashboardCard delay={1.5} className="col-span-full">
         <SectionHeader
            title="Nguồn phát Video"
            icon={Radio}
            iconColor="text-emerald-500"
            href="/admin/video-sources"
         />
         <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
               <p className="text-xs font-medium text-muted-foreground">Tổng cộng</p>
               {isLoading ? (
                  <div className="mx-auto mt-1 h-7 w-12 animate-pulse rounded bg-muted" />
               ) : (
                  <p className="mt-0.5 text-2xl font-bold text-emerald-500">
                     {videoSources?.toLocaleString() ?? 0}
                  </p>
               )}
            </div>
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-center">
               <p className="text-xs font-medium text-muted-foreground">Đang hoạt động</p>
               {isLoading ? (
                  <div className="mx-auto mt-1 h-7 w-12 animate-pulse rounded bg-muted" />
               ) : (
                  <p className="mt-0.5 text-2xl font-bold text-green-500">
                     {activeVideoSources?.toLocaleString() ?? 0}
                  </p>
               )}
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-center">
               <p className="text-xs font-medium text-muted-foreground">Ngừng hoạt động</p>
               {isLoading ? (
                  <div className="mx-auto mt-1 h-7 w-12 animate-pulse rounded bg-muted" />
               ) : (
                  <p className="mt-0.5 text-2xl font-bold text-amber-500">
                     {inactive.toLocaleString()}
                  </p>
               )}
            </div>
         </div>
      </DashboardCard>
   );
}

// ─── Recent Tables ──────────────────────────────────────────

function RecentUsersTable({
   users,
   isLoading,
}: {
   readonly users?: readonly AdminUser[];
   readonly isLoading: boolean;
}) {
   return (
      <DashboardCard delay={3}>
         <SectionHeader
            title="Người dùng mới"
            icon={Users}
            iconColor="text-green-500"
            href="/admin/users"
         />
         <div className="mt-4">
            {isLoading ? (
               <TableSkeleton rows={5} />
            ) : (
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>Tên</TableHead>
                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                        <TableHead>Vai trò</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {users?.map((u) => (
                        <TableRow key={u.id}>
                           <TableCell className="font-medium">{u.name ?? 'Chưa đặt tên'}</TableCell>
                           <TableCell className="hidden text-muted-foreground sm:table-cell">
                              {u.email}
                           </TableCell>
                           <TableCell>
                              <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>
                                 {u.role}
                              </Badge>
                           </TableCell>
                        </TableRow>
                     ))}
                     {!users?.length && (
                        <TableRow>
                           <TableCell
                              colSpan={3}
                              className="py-4 text-center text-muted-foreground"
                           >
                              Chưa có người dùng
                           </TableCell>
                        </TableRow>
                     )}
                  </TableBody>
               </Table>
            )}
         </div>
      </DashboardCard>
   );
}

function RecentMoviesTable({
   movies,
   isLoading,
   onAddSource,
}: {
   readonly movies?: readonly AdminMovieItem[];
   readonly isLoading: boolean;
   readonly onAddSource: (id: number, title: string) => void;
}) {
   return (
      <DashboardCard delay={4}>
         <SectionHeader
            title="Phim lẻ mới thêm"
            icon={TrendingUp}
            iconColor="text-blue-500"
            href="/admin/movies"
         />
         <div className="mt-4">
            {isLoading ? (
               <TableSkeleton rows={5} />
            ) : (
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>Phim</TableHead>
                        <TableHead className="hidden sm:table-cell">Đánh giá</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {movies?.map((m) => (
                        <TableRow key={m.id}>
                           <TableCell>
                              <div className="flex items-center gap-2.5">
                                 {m.posterPath ? (
                                    <Image
                                       src={`${TMDB_IMG}${m.posterPath}`}
                                       alt={m.title}
                                       width={32}
                                       height={48}
                                       className="hidden h-10 w-7 shrink-0 rounded object-cover sm:block"
                                    />
                                 ) : (
                                    <div className="hidden h-10 w-7 shrink-0 rounded bg-muted sm:block" />
                                 )}
                                 <Link
                                    href={`/admin/movies/${m.id}`}
                                    className="max-w-[160px] truncate text-sm font-medium hover:text-primary hover:underline"
                                 >
                                    {m.title}
                                 </Link>
                              </div>
                           </TableCell>
                           <TableCell className="hidden sm:table-cell">
                              <span className="text-amber-500">★</span> {m.voteAverage.toFixed(1)}
                           </TableCell>
                           <TableCell className="text-right">
                              <Button
                                 size="icon-sm"
                                 variant="ghost"
                                 className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600"
                                 onClick={() => onAddSource(m.id, m.title)}
                                 title="Thêm nguồn phát"
                              >
                                 <Wifi className="h-3.5 w-3.5" />
                              </Button>
                           </TableCell>
                        </TableRow>
                     ))}
                     {!movies?.length && (
                        <TableRow>
                           <TableCell
                              colSpan={3}
                              className="py-4 text-center text-muted-foreground"
                           >
                              Chưa có phim
                           </TableCell>
                        </TableRow>
                     )}
                  </TableBody>
               </Table>
            )}
         </div>
      </DashboardCard>
   );
}

function RecentTVShowsTable({
   tvShows,
   isLoading,
   onAddSource,
}: {
   readonly tvShows?: readonly AdminTVShowItem[];
   readonly isLoading: boolean;
   readonly onAddSource: (id: number, title: string) => void;
}) {
   return (
      <DashboardCard delay={5}>
         <SectionHeader
            title="Phim bộ mới thêm"
            icon={Tv}
            iconColor="text-purple-500"
            href="/admin/tv-shows"
         />
         <div className="mt-4">
            {isLoading ? (
               <TableSkeleton rows={5} />
            ) : (
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>Phim</TableHead>
                        <TableHead className="hidden sm:table-cell">Đánh giá</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {tvShows?.map((s) => (
                        <TableRow key={s.id}>
                           <TableCell>
                              <div className="flex items-center gap-2.5">
                                 {s.posterPath ? (
                                    <Image
                                       src={`${TMDB_IMG}${s.posterPath}`}
                                       alt={s.name}
                                       width={32}
                                       height={48}
                                       className="hidden h-10 w-7 shrink-0 rounded object-cover sm:block"
                                    />
                                 ) : (
                                    <div className="hidden h-10 w-7 shrink-0 rounded bg-muted sm:block" />
                                 )}
                                 <Link
                                    href={`/admin/tv-shows/${s.id}`}
                                    className="max-w-[160px] truncate text-sm font-medium hover:text-primary hover:underline"
                                 >
                                    {s.name}
                                 </Link>
                              </div>
                           </TableCell>
                           <TableCell className="hidden sm:table-cell">
                              <span className="text-amber-500">★</span> {s.voteAverage.toFixed(1)}
                           </TableCell>
                           <TableCell className="text-right">
                              <Button
                                 size="icon-sm"
                                 variant="ghost"
                                 className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600"
                                 onClick={() => onAddSource(s.id, s.name)}
                                 title="Thêm nguồn phát"
                              >
                                 <Wifi className="h-3.5 w-3.5" />
                              </Button>
                           </TableCell>
                        </TableRow>
                     ))}
                     {!tvShows?.length && (
                        <TableRow>
                           <TableCell
                              colSpan={3}
                              className="py-4 text-center text-muted-foreground"
                           >
                              Chưa có phim bộ
                           </TableCell>
                        </TableRow>
                     )}
                  </TableBody>
               </Table>
            )}
         </div>
      </DashboardCard>
   );
}

function TopRatedSection({
   topMovies,
   topTVShows,
   isLoading,
}: {
   readonly topMovies?: readonly AdminMovieItem[];
   readonly topTVShows?: readonly AdminTVShowItem[];
   readonly isLoading: boolean;
}) {
   return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
         <DashboardCard delay={6}>
            <SectionHeader
               title="Phim lẻ đánh giá cao"
               icon={Star}
               iconColor="text-amber-500"
               href="/admin/movies"
            />
            <div className="mt-4 space-y-3">
               {isLoading ? (
                  <TableSkeleton rows={5} />
               ) : (
                  topMovies?.map((m, i) => (
                     <div key={m.id} className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-500">
                           {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                           <Link
                              href={`/admin/movies/${m.id}`}
                              className="block truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                           >
                              {m.title}
                           </Link>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                           <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                           <span className="font-medium">{m.voteAverage.toFixed(1)}</span>
                        </div>
                     </div>
                  ))
               )}
               {!isLoading && !topMovies?.length && (
                  <p className="py-4 text-center text-sm text-muted-foreground">Chưa có dữ liệu</p>
               )}
            </div>
         </DashboardCard>

         <DashboardCard delay={7}>
            <SectionHeader
               title="Phim bộ đánh giá cao"
               icon={Star}
               iconColor="text-amber-500"
               href="/admin/tv-shows"
            />
            <div className="mt-4 space-y-3">
               {isLoading ? (
                  <TableSkeleton rows={5} />
               ) : (
                  topTVShows?.map((s, i) => (
                     <div key={s.id} className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-500">
                           {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                           <Link
                              href={`/admin/tv-shows/${s.id}`}
                              className="block truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                           >
                              {s.name}
                           </Link>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                           <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                           <span className="font-medium">{s.voteAverage.toFixed(1)}</span>
                        </div>
                     </div>
                  ))
               )}
               {!isLoading && !topTVShows?.length && (
                  <p className="py-4 text-center text-sm text-muted-foreground">Chưa có dữ liệu</p>
               )}
            </div>
         </DashboardCard>
      </div>
   );
}

function TableSkeleton({ rows }: { readonly rows: number }) {
   return (
      <div className="space-y-3">
         {Array.from({ length: rows }).map((_, i) => (
            <div key={`skel-${i}`} className="h-10 animate-pulse rounded bg-muted" />
         ))}
      </div>
   );
}

// ─── Main Dashboard Page ────────────────────────────────────

export default function AdminDashboardPage() {
   const { token, user } = useAuthStore();

   const { data: stats, isLoading } = useQuery({
      queryKey: ['admin-dashboard'],
      queryFn: () => getDashboardStats(token as string),
      enabled: !!token,
   });

   // Quick-add source dialog state
   const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
   const [prefill, setPrefill] = useState<{
      mediaType: 'movie' | 'tv';
      mediaId: number;
      mediaTitle: string;
   } | null>(null);

   const openSourceDialog = useCallback(
      (mediaType: 'movie' | 'tv', mediaId?: number, mediaTitle?: string) => {
         if (mediaId && mediaTitle) {
            setPrefill({ mediaType, mediaId, mediaTitle });
         } else {
            setPrefill(null);
         }
         setSourceDialogOpen(true);
      },
      [],
   );

   return (
      <div className="space-y-8">
         {/* Welcome Header */}
         <WelcomeHeader userName={user?.name ?? null} />

         {/* Stats Grid */}
         <section>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
               <StatCard
                  title="Phim lẻ"
                  value={stats?.movies}
                  icon={Film}
                  {...STAT_COLOR_MAP.movies}
                  loading={isLoading}
                  href="/admin/movies"
                  delay={0}
               />
               <StatCard
                  title="Phim bộ"
                  value={stats?.tvShows}
                  icon={Tv}
                  {...STAT_COLOR_MAP.tvShows}
                  loading={isLoading}
                  href="/admin/tv-shows"
                  delay={1}
               />
               <StatCard
                  title="Người dùng"
                  value={stats?.users}
                  icon={Users}
                  {...STAT_COLOR_MAP.users}
                  loading={isLoading}
                  href="/admin/users"
                  delay={2}
               />
               <StatCard
                  title="Diễn viên"
                  value={stats?.people}
                  icon={UserCircle}
                  {...STAT_COLOR_MAP.people}
                  loading={isLoading}
                  href="/admin/people"
                  delay={3}
               />
               <StatCard
                  title="Thể loại"
                  value={stats?.genres}
                  icon={Tag}
                  {...STAT_COLOR_MAP.genres}
                  loading={isLoading}
                  href="/admin/genres"
                  delay={4}
               />
               <StatCard
                  title="Nguồn phát"
                  value={stats?.videoSources}
                  icon={Wifi}
                  {...STAT_COLOR_MAP.videoSources}
                  loading={isLoading}
                  href="/admin/video-sources"
                  delay={5}
               />
               <StatCard
                  title="Movie Videos"
                  value={stats?.movieVideos}
                  icon={PlayCircle}
                  {...STAT_COLOR_MAP.movieVideos}
                  loading={isLoading}
                  delay={6}
               />
               <StatCard
                  title="TV Videos"
                  value={stats?.tvVideos}
                  icon={PlayCircle}
                  {...STAT_COLOR_MAP.tvVideos}
                  loading={isLoading}
                  delay={7}
               />
               <StatCard
                  title="Watchlist"
                  value={stats?.watchlistItems}
                  icon={Heart}
                  {...STAT_COLOR_MAP.watchlist}
                  loading={isLoading}
                  delay={8}
               />
            </div>
         </section>

         {/* Quick Actions */}
         <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
               <Zap className="h-4 w-4 text-amber-500" />
               Thao tác nhanh
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
               {/* Primary action — add video source */}
               <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openSourceDialog('movie')}
                  className="group flex items-center gap-3 rounded-lg border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 p-3 text-left shadow-sm transition-colors hover:border-emerald-500/60 hover:bg-emerald-500/10"
               >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
                     <Plus className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                     <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        Thêm nguồn phát
                     </p>
                     <p className="truncate text-xs text-muted-foreground">Thêm nhanh</p>
                  </div>
               </motion.button>

               <QuickActionCard
                  label="Quản lý Nguồn phát"
                  description={`${stats?.videoSources?.toLocaleString() ?? 0} nguồn`}
                  icon={Wifi}
                  href="/admin/video-sources"
                  iconColor="text-emerald-500"
               />
               <QuickActionCard
                  label="Nhập dữ liệu"
                  description="Import từ TMDB"
                  icon={Download}
                  href="/admin/import"
                  iconColor="text-green-500"
               />
               <QuickActionCard
                  label="Quản lý Phim"
                  description={`${stats?.movies?.toLocaleString() ?? 0} phim`}
                  icon={Film}
                  href="/admin/movies"
                  iconColor="text-blue-500"
               />
               <QuickActionCard
                  label="Quản lý TV"
                  description={`${stats?.tvShows?.toLocaleString() ?? 0} phim bộ`}
                  icon={Tv}
                  href="/admin/tv-shows"
                  iconColor="text-purple-500"
               />
               <QuickActionCard
                  label="Quản lý Users"
                  description={`${stats?.users?.toLocaleString() ?? 0} người dùng`}
                  icon={Users}
                  href="/admin/users"
                  iconColor="text-green-500"
               />
               <QuickActionCard
                  label="Diễn viên"
                  description={`${stats?.people?.toLocaleString() ?? 0} diễn viên`}
                  icon={UserCircle}
                  href="/admin/people"
                  iconColor="text-cyan-500"
               />
               <QuickActionCard
                  label="Thể loại"
                  description={`${stats?.genres?.toLocaleString() ?? 0} thể loại`}
                  icon={Tag}
                  href="/admin/genres"
                  iconColor="text-amber-500"
               />
            </div>
         </section>

         {/* Video Source Summary */}
         <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
               <Activity className="h-4 w-4 text-emerald-500" />
               Tổng quan nguồn phát
            </h2>
            <VideoSourceSummary
               videoSources={stats?.videoSources}
               activeVideoSources={stats?.activeVideoSources}
               isLoading={isLoading}
            />
         </section>

         {/* Content Status Breakdown */}
         <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
               <BarChart3 className="h-4 w-4 text-blue-500" />
               Phân bổ nội dung
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
               {/* Movie Status */}
               <DashboardCard delay={2}>
                  <SectionHeader title="Trạng thái Phim lẻ" icon={Film} iconColor="text-blue-500" />
                  <div className="mt-4 space-y-3">
                     {isLoading ? (
                        <TableSkeleton rows={4} />
                     ) : stats?.moviesByStatus.length ? (
                        stats.moviesByStatus.map((item) => (
                           <ProgressBar
                              key={item.status}
                              label={item.status}
                              value={item._count}
                              max={stats.movies}
                              colorClass={getStatusColor(item.status)}
                           />
                        ))
                     ) : (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                           Chưa có dữ liệu
                        </p>
                     )}
                  </div>
               </DashboardCard>

               {/* TV Show Status */}
               <DashboardCard delay={2}>
                  <SectionHeader title="Trạng thái Phim bộ" icon={Tv} iconColor="text-purple-500" />
                  <div className="mt-4 space-y-3">
                     {isLoading ? (
                        <TableSkeleton rows={4} />
                     ) : stats?.tvShowsByStatus.length ? (
                        stats.tvShowsByStatus.map((item) => (
                           <ProgressBar
                              key={item.status}
                              label={item.status}
                              value={item._count}
                              max={stats.tvShows}
                              colorClass={getStatusColor(item.status)}
                           />
                        ))
                     ) : (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                           Chưa có dữ liệu
                        </p>
                     )}
                  </div>
               </DashboardCard>
            </div>
         </section>

         {/* Genre Popularity */}
         <section>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
               <DashboardCard delay={3}>
                  <SectionHeader
                     title="Thể loại phổ biến (Phim lẻ)"
                     icon={Tag}
                     iconColor="text-amber-500"
                     href="/admin/genres"
                  />
                  <div className="mt-4 space-y-3">
                     {isLoading ? (
                        <TableSkeleton rows={6} />
                     ) : stats?.popularMovieGenres.length ? (
                        stats.popularMovieGenres.map((genre, i) => (
                           <ProgressBar
                              key={genre.id}
                              label={genre.name}
                              value={genre.count}
                              max={stats.popularMovieGenres[0].count}
                              colorClass={GENRE_BAR_COLORS[i % GENRE_BAR_COLORS.length]}
                           />
                        ))
                     ) : (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                           Chưa có dữ liệu
                        </p>
                     )}
                  </div>
               </DashboardCard>

               <DashboardCard delay={3}>
                  <SectionHeader
                     title="Thể loại phổ biến (Phim bộ)"
                     icon={Tag}
                     iconColor="text-purple-500"
                     href="/admin/genres"
                  />
                  <div className="mt-4 space-y-3">
                     {isLoading ? (
                        <TableSkeleton rows={6} />
                     ) : stats?.popularTVGenres.length ? (
                        stats.popularTVGenres.map((genre, i) => (
                           <ProgressBar
                              key={genre.id}
                              label={genre.name}
                              value={genre.count}
                              max={stats.popularTVGenres[0].count}
                              colorClass={GENRE_BAR_COLORS[i % GENRE_BAR_COLORS.length]}
                           />
                        ))
                     ) : (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                           Chưa có dữ liệu
                        </p>
                     )}
                  </div>
               </DashboardCard>
            </div>
         </section>

         {/* Recent Activity Tables */}
         <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
               <TrendingUp className="h-4 w-4 text-green-500" />
               Hoạt động gần đây
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
               <RecentUsersTable users={stats?.recentUsers} isLoading={isLoading} />
               <RecentMoviesTable
                  movies={stats?.recentMovies}
                  isLoading={isLoading}
                  onAddSource={(id, title) => openSourceDialog('movie', id, title)}
               />
               <RecentTVShowsTable
                  tvShows={stats?.recentTVShows}
                  isLoading={isLoading}
                  onAddSource={(id, title) => openSourceDialog('tv', id, title)}
               />
            </div>
         </section>

         {/* Top Rated Section */}
         <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
               <Star className="h-4 w-4 text-amber-500" />
               Đánh giá cao nhất
            </h2>
            <TopRatedSection
               topMovies={stats?.topRatedMovies}
               topTVShows={stats?.topRatedTVShows}
               isLoading={isLoading}
            />
         </section>

         {/* Quick Add Source Dialog */}
         <QuickAddSourceDialog
            open={sourceDialogOpen}
            onOpenChange={setSourceDialogOpen}
            prefillMediaType={prefill?.mediaType}
            prefillMediaId={prefill?.mediaId}
            prefillMediaTitle={prefill?.mediaTitle}
         />
      </div>
   );
}
