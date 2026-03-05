'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
   ShieldAlert,
   Loader2,
   LayoutDashboard,
   Film,
   Tv,
   Users,
   Tag,
   UserCircle,
   Download,
   Menu,
   X,
   ChevronLeft,
   PlayCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { Separator } from '@/components/ui/separator';

const ADMIN_NAV = [
   { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
   { href: '/admin/movies', label: 'Phim lẻ', icon: Film },
   { href: '/admin/tv-shows', label: 'Phim bộ', icon: Tv },
   { href: '/admin/video-sources', label: 'Nguồn phát', icon: PlayCircle },
   { href: '/admin/users', label: 'Người dùng', icon: Users },
   { href: '/admin/people', label: 'Diễn viên', icon: UserCircle },
   { href: '/admin/genres', label: 'Thể loại', icon: Tag },
   { href: '/admin/import', label: 'Nhập dữ liệu', icon: Download },
] as const;

export default function AdminLayout({ children }: { readonly children: React.ReactNode }) {
   const { user, isAuthenticated, isHydrated } = useAuthStore();
   const router = useRouter();
   const pathname = usePathname();
   const [isChecking, setIsChecking] = useState(true);
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
   const [, startTransition] = useTransition();

   const handleAuthCheck = useCallback(() => {
      if (!isHydrated) return;

      if (!isAuthenticated || user?.role !== 'ADMIN') {
         router.replace('/');
      } else {
         startTransition(() => {
            setIsChecking(false);
         });
      }
   }, [isAuthenticated, isHydrated, user, router]);

   useEffect(() => {
      handleAuthCheck();
   }, [handleAuthCheck]);

   const handleRouteChange = useCallback(() => {
      startTransition(() => {
         setIsSidebarOpen(false);
      });
   }, []);

   // Close mobile sidebar on route change
   useEffect(() => {
      handleRouteChange();
   }, [pathname, handleRouteChange]);

   if (!isHydrated || isChecking) {
      return (
         <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
         </div>
      );
   }

   return (
      <div className="flex min-h-screen">
         {/* Mobile sidebar overlay */}
         {isSidebarOpen && (
            <div
               className="fixed inset-0 z-40 bg-black/50 lg:hidden"
               onClick={() => setIsSidebarOpen(false)}
               onKeyDown={(e) => e.key === 'Escape' && setIsSidebarOpen(false)}
               role="button"
               tabIndex={0}
               aria-label="Close sidebar"
            />
         )}

         {/* Sidebar */}
         <aside
            className={`fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-card transition-transform duration-300 lg:translate-x-0 ${
               isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
         >
            <div className="flex items-center justify-between border-b border-border p-4">
               <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                     <ShieldAlert className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                     <span className="text-sm font-bold tracking-tight text-foreground">
                        Admin Panel
                     </span>
                  </div>
               </div>
               <Button
                  variant="ghost"
                  size="icon-sm"
                  className="lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label="Close sidebar"
               >
                  <X className="h-4 w-4" />
               </Button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
               {ADMIN_NAV.map((item) => {
                  const isActive =
                     item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                     <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                           isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                     >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                     </Link>
                  );
               })}
            </nav>

            <div className="border-t border-border p-3">
               {/* User info */}
               {user && (
                  <>
                     <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                           {user.name?.charAt(0).toUpperCase() ?? 'A'}
                        </div>
                        <div className="min-w-0 flex-1">
                           <p className="truncate text-sm font-medium text-foreground">
                              {user.name ?? 'Admin'}
                           </p>
                           <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                     </div>
                     <Separator className="mb-2" />
                  </>
               )}
               <Link
                  href="/"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
               >
                  <ChevronLeft className="h-4 w-4" />
                  Về trang chủ
               </Link>
            </div>
         </aside>

         {/* Main content */}
         <main className="flex-1 overflow-auto lg:ml-64">
            {/* Mobile header */}
            <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm lg:hidden">
               <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsSidebarOpen(true)}
                  aria-label="Open sidebar"
               >
                  <Menu className="h-5 w-5" />
               </Button>
               <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
            </div>

            <div className="p-4 md:p-6 lg:p-8">{children}</div>
         </main>
      </div>
   );
}
