'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  Tag,
  Hash,
  User,
  Activity,
  History,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { assetApi } from '@/services/api/asset.api';
import { ASSET_STATUS_CONFIG } from '@/utils/constants';

interface AssetDetail {
  asset: {
    _id: string;
    name: string;
    asset_tag: string;
    serial_number?: string;
    status: string;
    condition?: string;
    location?: string;
    acquisition_date?: string;
    acquisition_cost?: number;
    category?: { name: string } | string;
  };
  current_holder?: { employee_id?: { name: string } } | null;
  allocation_history?: Array<{ _id: string; allocated_date?: string; status: string; employee_id?: { name: string } }>;
  maintenance_history?: Array<{ _id: string; requested_at?: string; issue_description: string; requested_by?: { name: string } }>;
}

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data, isLoading, isError } = useQuery<AssetDetail>({
    queryKey: ['asset', id],
    queryFn: () => assetApi.get(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/assets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <p className="text-muted-foreground">Asset not found.</p>
      </div>
    );
  }

  const { asset, current_holder, allocation_history = [], maintenance_history = [] } = data;
  const categoryName =
    typeof asset.category === 'object' && asset.category ? asset.category.name : '—';
  const holderName = current_holder?.employee_id?.name;
  const statusCfg = ASSET_STATUS_CONFIG[asset.status];

  // Merge allocations + maintenance into one chronological lifecycle timeline.
  const timeline = [
    ...allocation_history.map((a) => ({
      id: a._id,
      date: a.allocated_date,
      action:
        a.status === 'Returned'
          ? `Returned by ${a.employee_id?.name ?? 'employee'}`
          : `Allocated to ${a.employee_id?.name ?? 'employee'}`,
      user: a.employee_id?.name ?? '—',
    })),
    ...maintenance_history.map((m) => ({
      id: m._id,
      date: m.requested_at,
      action: `Maintenance: ${m.issue_description}`,
      user: m.requested_by?.name ?? '—',
    })),
  ].sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/assets">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{asset.name}</h1>
              <Badge
                variant="secondary"
                className={statusCfg ? `${statusCfg.bg} ${statusCfg.text} border-0` : ''}
              >
                {asset.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
              <Hash className="h-3.5 w-3.5" /> {asset.asset_tag}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Asset Specifications</CardTitle>
            <CardDescription>Detailed tracking information for this asset.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                  <Tag className="h-4 w-4" /> Category
                </p>
                <p className="font-medium">{categoryName}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4" /> Condition
                </p>
                <Badge variant="outline">{asset.condition || '—'}</Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                  <Hash className="h-4 w-4" /> Serial Number
                </p>
                <p className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 p-1 px-2 rounded-md w-fit">
                  {asset.serial_number || '—'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4" /> Location
                </p>
                <p className="font-medium">{asset.location || '—'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4" /> Acquisition Date
                </p>
                <p className="font-medium">
                  {asset.acquisition_date
                    ? new Date(asset.acquisition_date).toLocaleDateString()
                    : '—'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                  <span className="font-bold font-mono">$</span> Acquisition Cost
                </p>
                <p className="font-medium">
                  {asset.acquisition_cost ? `$${asset.acquisition_cost.toLocaleString()}` : '—'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" /> Current Holder
                </p>
                <p className="font-medium">{holderName || 'Unassigned'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Side Panel: Lifecycle History */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" /> Asset Tag
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-2">
              <p className="font-mono text-2xl font-bold tracking-widest">{asset.asset_tag}</p>
              <p className="text-xs text-muted-foreground">System-generated identifier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" /> Lifecycle History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history yet.</p>
              ) : (
                <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-3 space-y-6">
                  {timeline.map((item) => (
                    <div key={item.id} className="relative pl-6">
                      <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-zinc-950" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.action}</span>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{item.date ? new Date(item.date).toLocaleDateString() : '—'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
