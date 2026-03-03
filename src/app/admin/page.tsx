'use client';

import { useQuery } from '@tanstack/react-query';
import { Film, Tv, Users, Tag, PlayCircle, UserCircle, Heart, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { getDashboardStats } from '@/services/admin-dashboard-service';
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

interface StatCardProps {
   readonly title: string;
   readonly value?: number;
   readonly icon: React.ReactNode;
   readonly loading: boolean;
   readonly href?: string;
}

function StatCard({ title, value, icon, loading, href }: StatCardProps) {
   const content = (
      <motion.div
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50"
      >
         <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
         </div>
         <div className="mt-1">
            {loading ? (
               <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
               <span className="text-3xl font-bold tracking-tight text-foreground">
                  {value?.toLocaleString() ?? 0}
               </span>
            )}
         </div>
      </motion.div>
   );

   if (href) {
      return <Link href={href}>{content}</Link>;
   }

   return content;
}

export default function AdminDashboardPage() {
   const { token } = useAuthStore();

   const { data: stats, isLoading } = useQuery({
      queryKey: ['admin-dashboard'],
      queryFn: () => getDashboardStats(token as string),
      enabled: !!token,
   });

   const STAT_CARDS: readonly {
      title: string;
      value: number | undefined;
      icon: React.ReactNode;
      href?: string;
   }[] = [
      {
         title: 'Phim lẻ',
         value: stats?.movies,
         icon: <Film className="h-5 w-5 text-blue-500" />,
         href: '/admin/movies',
      },
      {
         title: 'Phim bộ',
         value: stats?.tvShows,
         icon: <Tv className="h-5 w-5 text-purple-500" />,
         href: '/admin/tv-shows',
      },
      {
         title: 'Người dùng',
         value: stats?.users,
         icon: <Users className="h-5 w-5 text-green-500" />,
         href: '/admin/users',
      },
      {
         title: 'Diễn viên',
         value: stats?.people,
         icon: <UserCircle className="h-5 w-5 text-cyan-500" />,
         href: '/admin/people',
      },
      {
         title: 'Thể loại',
         value: stats?.genres,
         icon: <Tag className="h-5 w-5 text-amber-500" />,
         href: '/admin/genres',
      },
      {
         title: 'Movie Videos',
         value: stats?.movieVideos,
         icon: <PlayCircle className="h-5 w-5 text-rose-500" />,
      },
      {
         title: 'TV Videos',
         value: stats?.tvVideos,
         icon: <PlayCircle className="h-5 w-5 text-indigo-500" />,
      },
      {
         title: 'Watchlist',
         value: stats?.watchlistItems,
         icon: <Heart className="h-5 w-5 text-pink-500" />,
      },
   ];

   return (
      <div className="space-y-8">
         <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Tổng quan</h1>
            <p className="mt-1 text-sm text-muted-foreground">Thống kê tổng quan hệ thống</p>
         </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {STAT_CARDS.map((card) => (
               <StatCard
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  loading={isLoading}
                  href={card.href}
               />
            ))}
         </div>

         {/* Recent Activity Tables */}
         <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Users */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
               <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
                     <Users className="h-4 w-4 text-green-500" />
                     Người dùng mới
                  </h2>
                  <Link href="/admin/users" className="text-sm text-primary hover:underline">
                     Xem tất cả
                  </Link>
               </div>
               {isLoading ? (
                  <div className="space-y-3">
                     {Array.from({ length: 3 }).map((_, i) => (
                        <div
                           key={`skeleton-user-${i}`}
                           className="h-10 animate-pulse rounded bg-muted"
                        />
                     ))}
                  </div>
               ) : (
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Tên</TableHead>
                           <TableHead>Email</TableHead>
                           <TableHead>Vai trò</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {stats?.recentUsers.map((u) => (
                           <TableRow key={u.id}>
                              <TableCell className="font-medium">
                                 {u.name ?? 'Chưa đặt tên'}
                              </TableCell>
                              <TableCell className="text-muted-foreground">{u.email}</TableCell>
                              <TableCell>
                                 <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>
                                    {u.role}
                                 </Badge>
                              </TableCell>
                           </TableRow>
                        ))}
                        {!stats?.recentUsers.length && (
                           <TableRow>
                              <TableCell colSpan={3} className="text-center text-muted-foreground">
                                 Chưa có người dùng
                              </TableCell>
                           </TableRow>
                        )}
                     </TableBody>
                  </Table>
               )}
            </motion.div>

            {/* Recent Movies */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
               <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
                     <TrendingUp className="h-4 w-4 text-blue-500" />
                     Phim mới thêm
                  </h2>
                  <Link href="/admin/movies" className="text-sm text-primary hover:underline">
                     Xem tất cả
                  </Link>
               </div>
               {isLoading ? (
                  <div className="space-y-3">
                     {Array.from({ length: 3 }).map((_, i) => (
                        <div
                           key={`skeleton-movie-${i}`}
                           className="h-10 animate-pulse rounded bg-muted"
                        />
                     ))}
                  </div>
               ) : (
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Tên phim</TableHead>
                           <TableHead>Đánh giá</TableHead>
                           <TableHead>Videos</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {stats?.recentMovies.map((m) => (
                           <TableRow key={m.id}>
                              <TableCell className="max-w-[200px] truncate font-medium">
                                 {m.title}
                              </TableCell>
                              <TableCell>
                                 <span className="text-amber-500">★</span>{' '}
                                 {m.voteAverage.toFixed(1)}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                 {m._count.videos}
                              </TableCell>
                           </TableRow>
                        ))}
                        {!stats?.recentMovies.length && (
                           <TableRow>
                              <TableCell colSpan={3} className="text-center text-muted-foreground">
                                 Chưa có phim
                              </TableCell>
                           </TableRow>
                        )}
                     </TableBody>
                  </Table>
               )}
            </motion.div>
         </div>
      </div>
   );
}
