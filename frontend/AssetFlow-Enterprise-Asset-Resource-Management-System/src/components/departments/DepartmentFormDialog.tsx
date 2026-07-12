'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { departmentApi } from '@/services/api/department.api';
import { employeeApi } from '@/services/api/employee.api';

const NONE = 'none';

const departmentSchema = z.object({
  name: z.string().min(2, 'Department name is required'),
  parent_department_id: z.string().optional(),
  head_employee_id: z.string().optional(),
});

interface DepartmentFormDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function DepartmentFormDialog({ trigger, onSuccess }: DepartmentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentApi.list,
    enabled: open,
  });
  const { data: employeeResult } = useQuery({
    queryKey: ['employees', { limit: 100 }],
    queryFn: () => employeeApi.list({ limit: 100 }),
    enabled: open,
  });
  const employees = employeeResult?.data ?? [];

  const form = useForm<z.infer<typeof departmentSchema>>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: '', parent_department_id: NONE, head_employee_id: NONE },
  });

  async function onSubmit(values: z.infer<typeof departmentSchema>) {
    setIsLoading(true);
    try {
      await departmentApi.create({
        name: values.name,
        parent_department_id:
          values.parent_department_id && values.parent_department_id !== NONE
            ? values.parent_department_id
            : undefined,
        head_employee_id:
          values.head_employee_id && values.head_employee_id !== NONE
            ? values.head_employee_id
            : undefined,
      });
      toast.success('Department created');
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || 'Failed to create department'
          : 'Failed to create department';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Building className="mr-2 h-4 w-4" /> Add Department
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Department</DialogTitle>
          <DialogDescription>
            Add a new organizational unit to track assets against.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Engineering" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parent_department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Department</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE}>None (Top Level)</SelectItem>
                      {departments.map((d) => (
                        <SelectItem key={d._id} value={d._id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="head_employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Head</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select head (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE}>Unassigned</SelectItem>
                      {employees.map((e) => (
                        <SelectItem key={e._id} value={e._id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Department
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
