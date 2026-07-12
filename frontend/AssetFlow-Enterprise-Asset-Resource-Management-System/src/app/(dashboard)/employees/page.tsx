'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Shield, User } from 'lucide-react';
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
import { Loader2 } from 'lucide-react';
import { employeeApi } from '@/services/api/employee.api';
import { Employee } from '@/types';
import { ENTITY_STATUS_CONFIG, ROLE_CONFIG } from '@/utils/constants';

const roleIcon = (role?: string) => {
  if (role === 'Admin') return <Shield className="mr-2 h-4 w-4 text-violet-600" />;
  if (role === 'Asset Manager') return <Shield className="mr-2 h-4 w-4 text-blue-600" />;
  if (role === 'Department Head') return <User className="mr-2 h-4 w-4 text-amber-600" />;
  return <User className="mr-2 h-4 w-4 text-zinc-400" />;
};

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['employees', { search: searchTerm }],
    queryFn: () => employeeApi.list({ search: searchTerm || undefined, limit: 50 }),
  });

  const employees: Employee[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground mt-1">
            Organization directory with roles and departments.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-4 rounded-xl border">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
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
              <TableHead>Employee Name</TableHead>
              <TableHead>System Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => {
                const roleName =
                  typeof emp.role === 'object' && emp.role ? emp.role.name : undefined;
                const deptName =
                  typeof emp.department === 'object' && emp.department
                    ? emp.department.name
                    : '—';
                const roleCfg = roleName ? ROLE_CONFIG[roleName] : undefined;
                const statusCfg = ENTITY_STATUS_CONFIG[emp.status];
                return (
                  <TableRow key={emp._id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{emp.name}</span>
                        <span className="text-sm text-muted-foreground">{emp.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center font-medium">
                        {roleIcon(roleName)}
                        <span className={roleCfg?.text}>{roleName || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{deptName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusCfg ? `${statusCfg.bg} ${statusCfg.text} border-0` : ''}
                      >
                        {emp.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {data?.meta && (
        <p className="text-xs text-muted-foreground text-right">
          Showing {employees.length} of {data.meta.total} employees
        </p>
      )}
    </div>
  );
}
