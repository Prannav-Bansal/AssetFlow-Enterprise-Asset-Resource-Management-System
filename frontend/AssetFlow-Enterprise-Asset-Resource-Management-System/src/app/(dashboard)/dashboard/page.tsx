'use client';

import { useQuery } from '@tanstack/react-query';
import { Package, CalendarCheck, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { dashboardApi } from '@/services/api/dashboard.api';
import { assetApi } from '@/services/api/asset.api';
import { activityApi } from '@/services/api/activity.api';
import { Asset, ActivityLog } from '@/types';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

function formatRelative(iso?: string) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: dashboardApi.getKpis,
  });

  // Fetch a page of assets to build a real "by category" distribution.
  const { data: assetResult } = useQuery({
    queryKey: ['assets', { limit: 100 }],
    queryFn: () => assetApi.list({ limit: 100 }),
  });

  const { data: activityResult } = useQuery({
    queryKey: ['activity', { limit: 6 }],
    queryFn: () => activityApi.list({ limit: 6 }),
  });

  // Real category distribution from the fetched assets.
  const categoryData = (() => {
    const counts: Record<string, number> = {};
    (assetResult?.data ?? []).forEach((a: Asset) => {
      const name =
        typeof a.category === 'object' && a.category ? a.category.name : 'Uncategorized';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  // Real asset-status distribution from KPIs.
  const statusData = kpis
    ? [
        { name: 'Available', total: kpis.assets_available },
        { name: 'Allocated', total: kpis.assets_allocated },
        { name: 'Maintenance', total: kpis.assets_under_maintenance },
      ]
    : [];

  const recentActivity: ActivityLog[] = activityResult?.data ?? [];

  const kpiCards = [
    {
      title: 'Assets Available',
      value: kpis?.assets_available,
      icon: Package,
      color: 'text-indigo-600 dark:text-indigo-400',
      hint: 'Ready to allocate',
    },
    {
      title: 'Active Bookings',
      value: kpis?.active_bookings,
      icon: CalendarCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      hint: `${kpis?.upcoming_returns ?? 0} returns due this week`,
    },
    {
      title: 'Under Maintenance',
      value: kpis?.assets_under_maintenance,
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-500',
      hint: `${kpis?.maintenance_requests_today ?? 0} new requests today`,
    },
    {
      title: 'Overdue Returns',
      value: kpis?.overdue_returns,
      icon: Clock,
      color: 'text-red-600 dark:text-red-400',
      hint: 'Past expected return date',
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of your organization&apos;s assets and resource utilization.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpisLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  (kpi.value ?? 0)
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Assets by Status</CardTitle>
            <CardDescription>Live distribution across the asset lifecycle.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Assets by Category</CardTitle>
            <CardDescription>Distribution of inventory across categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {categoryData.map((category, i) => (
                <div key={category.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs font-medium text-muted-foreground">{category.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table Row */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions recorded across the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No activity yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentActivity.map((activity) => (
                  <TableRow key={activity._id}>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {activity.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate">{activity.description}</TableCell>
                    <TableCell>
                      {typeof activity.employee === 'object' && activity.employee
                        ? activity.employee.name
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatRelative(activity.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
