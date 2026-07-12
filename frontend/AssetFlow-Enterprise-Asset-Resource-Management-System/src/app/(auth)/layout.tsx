import { ReactNode } from 'react';
import { Package } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
        <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        <span className="text-xl font-bold tracking-tight">AssetFlow</span>
      </div>
      
      <div className="w-full max-w-md">
        {children}
      </div>
      
      <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <p>&copy; {new Date().getFullYear()} AssetFlow. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms</Link>
          <Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy</Link>
        </div>
      </div>
    </div>
  );
}
