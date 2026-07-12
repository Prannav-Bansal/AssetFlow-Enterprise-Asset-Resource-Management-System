'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { assetApi } from '@/services/api/asset.api';
import { Asset } from '@/types';
import { ASSET_STATUS_CONFIG } from '@/utils/constants';
import { AssetFormDialog } from '@/components/assets/AssetFormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Filter, Eye, Loader2 } from 'lucide-react';

const STATUS_OPTIONS = [
  'All',
  'Available',
  'Allocated',
  'Reserved',
  'Under Maintenance',
  'Lost',
  'Retired',
  'Disposed',
];

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['assets', { search: searchTerm, status: statusFilter }],
    queryFn: () =>
      assetApi.list({
        search: searchTerm || undefined,
        status: statusFilter === 'All' ? undefined : (statusFilter as never),
        limit: 50,
      }),
  });

  const assets: Asset[] = data?.data ?? [];

  const statusBadge = (status: string) => {
    const cfg = ASSET_STATUS_CONFIG[status];
    return (
      <Badge variant="secondary" className={cfg ? `${cfg.bg} ${cfg.text} border-0` : ''}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization&apos;s physical devices and resources.
          </p>
        </div>
        <AssetFormDialog onSuccess={() => refetch()} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-zinc-950 p-4 rounded-xl border">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, tag or serial..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Status: {statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem key={opt} onClick={() => setStatusFilter(opt)}>
                  {opt}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-xl border bg-white dark:bg-zinc-950 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tag</TableHead>
              <TableHead>Asset Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-destructive">
                  Failed to load assets.
                </TableCell>
              </TableRow>
            ) : assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No assets found.
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow key={asset._id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {asset.asset_tag}
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/assets/${asset._id}`}
                      className="hover:underline hover:text-indigo-600"
                    >
                      {asset.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {typeof asset.category === 'object' && asset.category
                      ? asset.category.name
                      : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {asset.serial_number || '—'}
                  </TableCell>
                  <TableCell>{asset.location || '—'}</TableCell>
                  <TableCell>{statusBadge(asset.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/assets/${asset._id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data?.meta && (
        <p className="text-xs text-muted-foreground text-right">
          Showing {assets.length} of {data.meta.total} assets
        </p>
      )}
    </div>
  );
}
