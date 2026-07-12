'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Users, Loader2 } from 'lucide-react';
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
import { DepartmentFormDialog } from '@/components/departments/DepartmentFormDialog';
import { departmentApi } from '@/services/api/department.api';
import { Department } from '@/types';
import { ENTITY_STATUS_CONFIG } from '@/utils/constants';

export default function DepartmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentApi.list,
  });

  const departments: Department[] = (data ?? []).filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground mt-1">
            Manage organizational structure and departmental hierarchies.
          </p>
        </div>
        <DepartmentFormDialog onSuccess={() => refetch()} />
      </div>

      <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-4 rounded-xl border">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
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
              <TableHead>Department Name</TableHead>
              <TableHead>Parent Department</TableHead>
              <TableHead>Department Head</TableHead>
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
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No departments found.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => {
                const parentName =
                  typeof dept.parent_department_id === 'object' && dept.parent_department_id
                    ? (dept.parent_department_id as { name: string }).name
                    : null;
                const headName =
                  typeof dept.head_employee_id === 'object' && dept.head_employee_id
                    ? (dept.head_employee_id as { name: string }).name
                    : null;
                const statusCfg = ENTITY_STATUS_CONFIG[dept.status];
                return (
                  <TableRow key={dept._id}>
                    <TableCell className="font-medium text-indigo-600">{dept.name}</TableCell>
                    <TableCell className="text-muted-foreground">{parentName || '—'}</TableCell>
                    <TableCell>
                      {headName ? (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{headName}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusCfg ? `${statusCfg.bg} ${statusCfg.text} border-0` : ''}
                      >
                        {dept.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
