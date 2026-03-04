'use client';

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
} from 'lucide-react';
import Link from 'next/link';

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
import {
   StatCard,
   QuickActionCard,
   ProgressBar,
   SectionHeader,
   DashboardCard,
} from '@/components/admin/dashboard-widgets';

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
      <div className="space-y-1">
         <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {greeting}, {userName ?? 'Admin'} 👋
         </h1>
         <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('vi-VN', {
               weekday: 'long',
               year: 'numeric',
               month: 'long',
               day: 'numeric',
            })}
            {' — '}Tổng quan hệ thống quản trị
         </p>
      </div>
   );
}

function getGreeting(): string {
   const hour = new Date().getHours();
   if (hour < 12) return 'Chào buổi sáng';
   if (hour < 18) return 'Chào buổi chiều';
   return 'Chào buổi tối';
}

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
}: {
   readonly movies?: readonly AdminMovieItem[];
   readonly isLoading: boolean;
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
                        <TableHead>Tên phim</TableHead>
                        <TableHead className="hidden sm:table-cell">Đánh giá</TableHead>
                        <TableHead>Videos</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {movies?.map((m) => (
                        <TableRow key={m.id}>
                           <TableCell className="max-w-[200px] truncate font-medium">
                              <Link
                                 href={`/admin/movies/${m.id}`}
                                 className="hover:text-primary hover:underline"
                              >
                                 {m.title}
                              </Link>
                           </TableCell>
                           <TableCell className="hidden sm:table-cell">
                              <span className="text-amber-500">★</span> {m.voteAverage.toFixed(1)}
                           </TableCell>
                           <TableCell className="text-muted-foreground">
                              {m._count.videos}
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
}: {
   readonly tvShows?: readonly AdminTVShowItem[];
   readonly isLoading: boolean;
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
                        <TableHead>Tên phim</TableHead>
                        <TableHead className="hidden sm:table-cell">Đánh giá</TableHead>
                        <TableHead>Seasons</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {tvShows?.map((s) => (
                        <TableRow key={s.id}>
                           <TableCell className="max-w-[200px] truncate font-medium">
                              <Link
                                 href={`/admin/tv-shows/${s.id}`}
                                 className="hover:text-primary hover:underline"
                              >
                                 {s.name}
                              </Link>
                           </TableCell>
                           <TableCell className="hidden sm:table-cell">
                              <span className="text-amber-500">★</span> {s.voteAverage.toFixed(1)}
                           </TableCell>
                           <TableCell className="text-muted-foreground">
                              {s.numberOfSeasons}
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

   return (
      <div className="space-y-8">
         {/* Welcome Header */}
         <WelcomeHeader userName={user?.name ?? null} />

         {/* Stats Grid */}
         <section>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
                  title="Movie Videos"
                  value={stats?.movieVideos}
                  icon={PlayCircle}
                  {...STAT_COLOR_MAP.movieVideos}
                  loading={isLoading}
                  delay={5}
               />
               <StatCard
                  title="TV Videos"
                  value={stats?.tvVideos}
                  icon={PlayCircle}
                  {...STAT_COLOR_MAP.tvVideos}
                  loading={isLoading}
                  delay={6}
               />
               <StatCard
                  title="Watchlist"
                  value={stats?.watchlistItems}
                  icon={Heart}
                  {...STAT_COLOR_MAP.watchlist}
                  loading={isLoading}
                  delay={7}
               />
            </div>
         </section>

         {/* Quick Actions */}
         <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
               <Zap className="h-4 w-4 text-amber-500" />
               Thao tác nhanh
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
               <QuickActionCard
                  label="Nhập dữ liệu"
                  description="Import từ TMDB"
                  icon={Download}
                  href="/admin/import"
                  iconColor="text-green-500"
               />
               <QuickActionCard
                  label="Quản lý Phim"
                  description={`${stats?.movies.toLocaleString() ?? 0} phim`}
                  icon={Film}
                  href="/admin/movies"
                  iconColor="text-blue-500"
               />
               <QuickActionCard
                  label="Quản lý TV"
                  description={`${stats?.tvShows.toLocaleString() ?? 0} phim bộ`}
                  icon={Tv}
                  href="/admin/tv-shows"
                  iconColor="text-purple-500"
               />
               <QuickActionCard
                  label="Quản lý Users"
                  description={`${stats?.users.toLocaleString() ?? 0} người dùng`}
                  icon={Users}
                  href="/admin/users"
                  iconColor="text-green-500"
               />
               <QuickActionCard
                  label="Thể loại"
                  description={`${stats?.genres.toLocaleString() ?? 0} thể loại`}
                  icon={Tag}
                  href="/admin/genres"
                  iconColor="text-amber-500"
               />
            </div>
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
               <RecentMoviesTable movies={stats?.recentMovies} isLoading={isLoading} />
               <RecentTVShowsTable tvShows={stats?.recentTVShows} isLoading={isLoading} />
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
      </div>
   );
}
