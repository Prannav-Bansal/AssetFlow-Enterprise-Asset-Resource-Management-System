'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  CalendarCheck, 
  ClipboardCheck, 
  Building2, 
  Users, 
  Activity, 
  Settings 
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

// Role names must match the backend exactly: Admin, Asset Manager,
// Department Head, Employee.
const ALL_ROLES = ['Admin', 'Asset Manager', 'Department Head', 'Employee'];
const MANAGERS = ['Admin', 'Asset Manager', 'Department Head'];

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ALL_ROLES },
  { title: 'Assets', href: '/assets', icon: Package, roles: ALL_ROLES },
  { title: 'Bookings', href: '/bookings', icon: CalendarCheck, roles: ALL_ROLES },
  { title: 'Audits', href: '/audits', icon: ClipboardCheck, roles: MANAGERS },
  { title: 'Departments', href: '/departments', icon: Building2, roles: ['Admin'] },
  { title: 'Employees', href: '/employees', icon: Users, roles: ['Admin'] },
  { title: 'Activity Logs', href: '/activity', icon: Activity, roles: ['Admin'] },
  { title: 'Settings', href: '/settings', icon: Settings, roles: ALL_ROLES },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || 'Employee';

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-zinc-950 text-zinc-300 border-r border-zinc-800">
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white text-xl tracking-tight">
          <Package className="h-6 w-6 text-indigo-500" />
          <span>AssetFlow</span>
        </Link>
      </div>
      
      <div className="flex-1 px-4 py-6 space-y-1">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Button
              key={item.href}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-start gap-3 px-3 py-2 h-10 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 hover:text-indigo-300" 
                  : "hover:bg-zinc-800/50 hover:text-white"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className={cn("h-4 w-4", isActive ? "text-indigo-400" : "text-zinc-400")} />
                {item.title}
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
