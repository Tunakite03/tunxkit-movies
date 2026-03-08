import Link from 'next/link';
import { CheckCircle2, XCircle, Film } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { verifyEmail } from '@/actions/auth-actions';
import { SITE_NAME } from '@/constants';

interface VerifyEmailPageProps {
   searchParams: Promise<{ token?: string }>;
}

/**
 * Handles the email verification callback.
 * Reads the token from the URL and calls the server action to verify the email.
 * Rendered as an async server component — no useEffect needed.
 */
export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
   const { token } = await searchParams;

   if (!token) {
      return (
         <PageShell>
            <ErrorView message="Link xác minh không hợp lệ." />
         </PageShell>
      );
   }

   const result = await verifyEmail(token);

   return (
      <PageShell>
         {result.success ? (
            <SuccessView message={result.message} />
         ) : (
            <ErrorView message={result.message} />
         )}
      </PageShell>
   );
}

function PageShell({ children }: { children: React.ReactNode }) {
   return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
         <Link href="/" className="mb-8 flex items-center gap-2 text-primary">
            <Film className="size-7" />
            <span className="text-xl font-bold tracking-tight">{SITE_NAME}</span>
         </Link>
         <div className="w-full max-w-sm space-y-6 text-center">{children}</div>
      </div>
   );
}

function SuccessView({ message }: { message: string }) {
   return (
      <div className="flex flex-col items-center gap-4">
         <CheckCircle2 className="size-12 text-green-500" />
         <h1 className="text-2xl font-bold tracking-tight">Xác minh thành công!</h1>
         <p className="text-sm text-muted-foreground">{message}</p>
         <Button asChild className="mt-2">
            <Link href="/sign-in">Đăng nhập</Link>
         </Button>
      </div>
   );
}

function ErrorView({ message }: { message: string }) {
   return (
      <div className="flex flex-col items-center gap-4">
         <XCircle className="size-12 text-destructive" />
         <h1 className="text-2xl font-bold tracking-tight">Xác minh thất bại</h1>
         <p className="text-sm text-muted-foreground">{message}</p>
         <Button asChild variant="outline" className="mt-2">
            <Link href="/sign-in">Quay lại đăng nhập</Link>
         </Button>
      </div>
   );
}
