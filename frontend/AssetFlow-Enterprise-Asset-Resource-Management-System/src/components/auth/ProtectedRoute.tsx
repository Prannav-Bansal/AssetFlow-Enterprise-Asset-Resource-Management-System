'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && (!isAuthenticated || !accessToken)) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isMounted, isAuthenticated, accessToken, router, pathname]);

  // Show nothing or a loader while hydrating on the client
  if (!isMounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Prevent flash of protected content before redirect
  if (!isAuthenticated || !accessToken) {
    return null;
  }

  return <>{children}</>;
}
