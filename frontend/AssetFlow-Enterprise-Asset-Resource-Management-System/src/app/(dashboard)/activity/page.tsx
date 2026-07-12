'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
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
import { activityApi } from '@/services/api/activity.api';
import { ActivityLog } from '@/types';

// Colour the action badge by the verb embedded in the action code
// (e.g. ASSET_CREATED → green, *_REJECTED → red).
const actionColor = (action: string) => {
  if (/CREATED|APPROVED|RESOLVED|LOGIN|RETURNED/.test(action))
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (/REJECTED|DELETED|LOST|CLOSED/.test(action))
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  if (/UPDATED|STATUS|CHANGED|ASSIGNED|RESCHEDULED/.test(action))
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
};

export default function ActivityLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['activity', { search: searchTerm }],
    queryFn: () => activityApi.list({ search: searchTerm || undefined, limit: 50 } as never),
  });

  const logs: ActivityLog[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Activity</h1>
          <p className="text-muted-foreground mt-1">
            Audit trail of all actions performed across the organization.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-4 rounded-xl border">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by description..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-white dark:bg-zinc-950 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target Entity</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No activity logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <Clock className="h-3.5 w-3.5" />
                      {log.created_at
                        ? format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')
                        : '—'}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {typeof log.employee === 'object' && log.employee ? log.employee.name : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={actionColor(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{log.entity_type}</span>
                  </TableCell>
                  <TableCell className="max-w-[320px] truncate" title={log.description}>
                    {log.description}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
