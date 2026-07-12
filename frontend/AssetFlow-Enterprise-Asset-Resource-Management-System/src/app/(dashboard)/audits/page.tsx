'use client';

import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck, Wrench, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MaintenanceFormDialog } from '@/components/maintenance/MaintenanceFormDialog';
import { maintenanceApi } from '@/services/api/maintenance.api';
import { auditApi } from '@/services/api/audit.api';
import { MaintenanceRequest, AuditCycle } from '@/types';
import { MAINTENANCE_STATUS_CONFIG, AUDIT_CYCLE_STATUS_CONFIG } from '@/utils/constants';

export default function AuditsPage() {
  const { data: maintenanceResult, isLoading: mLoading, refetch: refetchMaintenance } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => maintenanceApi.list({ limit: 50 }),
  });
  const { data: cycles = [], isLoading: aLoading } = useQuery({
    queryKey: ['audit-cycles'],
    queryFn: auditApi.listCycles,
  });

  const tickets: MaintenanceRequest[] = maintenanceResult?.data ?? [];

  const assetName = (t: MaintenanceRequest) =>
    typeof t.asset === 'object' && t.asset ? t.asset.name : 'Asset';
  const reporterName = (t: MaintenanceRequest) =>
    typeof t.requester === 'object' && t.requester ? t.requester.name : '—';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audits &amp; Maintenance</h1>
          <p className="text-muted-foreground mt-1">
            Track physical inventory verifications and repair tickets.
          </p>
        </div>
        <MaintenanceFormDialog onSuccess={() => refetchMaintenance()} />
      </div>

      <Tabs defaultValue="maintenance" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" /> Repair Tickets
            </TabsTrigger>
            <TabsTrigger value="audits" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" /> Audit Cycles
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Maintenance Tickets Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <div className="rounded-xl border bg-white dark:bg-zinc-950 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Issue Details</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date Logged</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No maintenance requests.
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => {
                    const cfg = MAINTENANCE_STATUS_CONFIG[ticket.status];
                    return (
                      <TableRow key={ticket._id}>
                        <TableCell className="font-medium">{assetName(ticket)}</TableCell>
                        <TableCell
                          className="max-w-[220px] truncate"
                          title={ticket.issue_description}
                        >
                          {ticket.issue_description}
                        </TableCell>
                        <TableCell>{reporterName(ticket)}</TableCell>
                        <TableCell>{ticket.priority}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {ticket.requested_at
                            ? format(new Date(ticket.requested_at), 'MMM d, yyyy')
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cfg ? `${cfg.bg} ${cfg.text} border-0` : ''}
                          >
                            {ticket.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Audit Cycles Tab */}
        <TabsContent value="audits" className="space-y-4">
          <div className="rounded-xl border bg-white dark:bg-zinc-950 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle Name</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : cycles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No audit cycles yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  cycles.map((cycle: AuditCycle) => {
                    const cfg = AUDIT_CYCLE_STATUS_CONFIG[cycle.status];
                    const scope =
                      cycle.scope_location ||
                      (typeof cycle.scope_department_id === 'object' && cycle.scope_department_id
                        ? (cycle.scope_department_id as { name: string }).name
                        : 'All assets');
                    return (
                      <TableRow key={cycle._id}>
                        <TableCell className="font-medium">{cycle.name}</TableCell>
                        <TableCell className="text-muted-foreground">{scope}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {cycle.start_date
                            ? format(new Date(cycle.start_date), 'MMM d, yyyy')
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cfg ? `${cfg.bg} ${cfg.text} border-0` : ''}
                          >
                            {cycle.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
