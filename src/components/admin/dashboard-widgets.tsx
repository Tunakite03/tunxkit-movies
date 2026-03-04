'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

// ─── Stat Card ──────────────────────────────────────────────

interface StatCardProps {
   readonly title: string;
   readonly value?: number;
   readonly icon: LucideIcon;
   readonly iconColor: string;
   readonly iconBg: string;
   readonly loading: boolean;
   readonly href?: string;
   readonly delay?: number;
}

/** Stat card with colored icon background */
export function StatCard({
   title,
   value,
   icon: Icon,
   iconColor,
   iconBg,
   loading,
   href,
   delay = 0,
}: StatCardProps) {
   const content = (
      <motion.div
         initial={{ opacity: 0, y: 12 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: delay * 0.05, duration: 0.3 }}
         className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
      >
         <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
         >
            <Icon className={`h-6 w-6 ${iconColor}`} />
         </div>
         <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
            <div className="mt-0.5">
               {loading ? (
                  <div className="h-7 w-20 animate-pulse rounded bg-muted" />
               ) : (
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                     {value?.toLocaleString() ?? 0}
                  </span>
               )}
            </div>
         </div>
      </motion.div>
   );

   if (href) {
      return (
         <Link href={href} className="block">
            {content}
         </Link>
      );
   }

   return content;
}

// ─── Quick Action Card ──────────────────────────────────────

interface QuickActionProps {
   readonly label: string;
   readonly description: string;
   readonly icon: LucideIcon;
   readonly href: string;
   readonly iconColor: string;
}

/** Quick action shortcut card */
export function QuickActionCard({
   label,
   description,
   icon: Icon,
   href,
   iconColor,
}: QuickActionProps) {
   return (
      <Link href={href}>
         <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-colors hover:border-primary/30 hover:bg-accent/50"
         >
            <Icon className={`h-5 w-5 shrink-0 ${iconColor}`} />
            <div className="min-w-0">
               <p className="text-sm font-medium text-foreground">{label}</p>
               <p className="truncate text-xs text-muted-foreground">{description}</p>
            </div>
         </motion.div>
      </Link>
   );
}

// ─── Progress Bar ───────────────────────────────────────────

interface ProgressBarProps {
   readonly label: string;
   readonly value: number;
   readonly max: number;
   readonly colorClass?: string;
}

/** Horizontal progress bar with label and count */
export function ProgressBar({ label, value, max, colorClass = 'bg-primary' }: ProgressBarProps) {
   const percentage = max > 0 ? Math.round((value / max) * 100) : 0;

   return (
      <div className="space-y-1">
         <div className="flex items-center justify-between text-sm">
            <span className="truncate font-medium text-foreground">{label}</span>
            <span className="ml-2 shrink-0 text-muted-foreground">{value.toLocaleString()}</span>
         </div>
         <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
               initial={{ width: 0 }}
               animate={{ width: `${percentage}%` }}
               transition={{ duration: 0.6, ease: 'easeOut' }}
               className={`h-full rounded-full ${colorClass}`}
            />
         </div>
      </div>
   );
}

// ─── Section Header ─────────────────────────────────────────

interface SectionHeaderProps {
   readonly title: string;
   readonly icon: LucideIcon;
   readonly iconColor: string;
   readonly href?: string;
   readonly linkText?: string;
}

/** Section header with optional "View all" link */
export function SectionHeader({
   title,
   icon: Icon,
   iconColor,
   href,
   linkText = 'Xem tất cả',
}: SectionHeaderProps) {
   return (
      <div className="flex items-center justify-between">
         <h2 className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
            <Icon className={`h-4 w-4 ${iconColor}`} />
            {title}
         </h2>
         {href && (
            <Link href={href} className="text-sm text-primary hover:underline">
               {linkText}
            </Link>
         )}
      </div>
   );
}

// ─── Dashboard Card Wrapper ─────────────────────────────────

interface DashboardCardProps {
   readonly children: React.ReactNode;
   readonly delay?: number;
   readonly className?: string;
}

/** Animated card wrapper for dashboard sections */
export function DashboardCard({ children, delay = 0, className = '' }: DashboardCardProps) {
   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: delay * 0.1, duration: 0.4 }}
         className={`rounded-lg border border-border bg-card p-4 shadow-sm ${className}`}
      >
         {children}
      </motion.div>
   );
}

// ─── Empty State ────────────────────────────────────────────

interface EmptyStateProps {
   readonly message: string;
   readonly colSpan?: number;
}

/** Empty state row for tables */
export function EmptyTableRow({ message, colSpan = 3 }: EmptyStateProps) {
   return (
      <tr>
         <td colSpan={colSpan} className="py-6 text-center text-sm text-muted-foreground">
            {message}
         </td>
      </tr>
   );
}
