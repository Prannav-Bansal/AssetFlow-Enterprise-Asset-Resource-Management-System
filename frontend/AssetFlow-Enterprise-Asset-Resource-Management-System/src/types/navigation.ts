import { LucideIcon } from 'lucide-react';
import { UserRole } from './index';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  badge?: number;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  title: string;
  href?: string;
}
