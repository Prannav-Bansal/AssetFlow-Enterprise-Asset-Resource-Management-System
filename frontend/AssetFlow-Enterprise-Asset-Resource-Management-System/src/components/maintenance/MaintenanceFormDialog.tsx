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
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Wrench, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { maintenanceApi } from '@/services/api/maintenance.api';
import { assetApi } from '@/services/api/asset.api';
import { Priority } from '@/types';

const maintenanceSchema = z.object({
  asset_id: z.string().min(1, 'Please select an asset'),
  issue_description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['Low', 'Medium', 'High']),
});

interface MaintenanceFormDialogProps {
  trigger?: React.ReactNode;
  preselectedAssetId?: string;
  onSuccess?: () => void;
}

export function MaintenanceFormDialog({
  trigger,
  preselectedAssetId,
  onSuccess,
}: MaintenanceFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: assetResult } = useQuery({
    queryKey: ['assets', { limit: 100 }],
    queryFn: () => assetApi.list({ limit: 100 }),
    enabled: open,
  });
  const assets = assetResult?.data ?? [];

  const form = useForm<z.infer<typeof maintenanceSchema>>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      asset_id: preselectedAssetId || '',
      issue_description: '',
      priority: 'Medium',
    },
  });

  async function onSubmit(values: z.infer<typeof maintenanceSchema>) {
    setIsLoading(true);
    try {
      await maintenanceApi.create({
        asset_id: values.asset_id,
        issue_description: values.issue_description,
        priority: values.priority as Priority,
      });
      toast.success('Maintenance request submitted');
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || 'Failed to submit maintenance request'
          : 'Failed to submit maintenance request';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="text-amber-600 dark:text-amber-500 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/50">
            <Wrench className="mr-2 h-4 w-4" /> Report Issue
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
          <DialogDescription>
            Submit a maintenance request for a damaged or malfunctioning asset.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="asset_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset / Resource</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!preselectedAssetId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an asset" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assets.map((a) => (
                        <SelectItem key={a._id} value={a._id}>
                          {a.name} ({a.asset_tag})
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
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {['Low', 'Medium', 'High'].map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
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
              name="issue_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe the problem</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g. The screen is flickering and randomly turning off..." 
                      className="resize-none min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-amber-600 hover:bg-amber-700 text-white">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Ticket
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
