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
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { bookingApi } from '@/services/api/booking.api';
import { assetApi } from '@/services/api/asset.api';

const bookingSchema = z
  .object({
    asset_id: z.string().min(1, 'Resource is required'),
    start_datetime: z.string().min(1, 'Start time is required'),
    end_datetime: z.string().min(1, 'End time is required'),
    purpose: z.string().optional(),
  })
  .refine((data) => new Date(data.end_datetime) > new Date(data.start_datetime), {
    message: 'End time must be after start time',
    path: ['end_datetime'],
  });

interface BookingFormDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function BookingFormDialog({ trigger, onSuccess }: BookingFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Only bookable assets can be reserved.
  const { data: assetResult } = useQuery({
    queryKey: ['assets', { is_bookable: true }],
    queryFn: () => assetApi.list({ is_bookable: true, limit: 100 }),
    enabled: open,
  });
  const bookableAssets = assetResult?.data ?? [];

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { asset_id: '', start_datetime: '', end_datetime: '', purpose: '' },
  });

  async function onSubmit(values: z.infer<typeof bookingSchema>) {
    setIsLoading(true);
    try {
      await bookingApi.create({
        asset_id: values.asset_id,
        start_datetime: new Date(values.start_datetime).toISOString(),
        end_datetime: new Date(values.end_datetime).toISOString(),
        purpose: values.purpose || undefined,
      });
      toast.success('Booking confirmed');
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 409) {
        // Backend rejected an overlapping time slot — surface the conflict.
        const conflict = error.response.data?.details?.conflicting_booking;
        const when = conflict
          ? ` (conflicts ${new Date(conflict.start).toLocaleString()} – ${new Date(
              conflict.end
            ).toLocaleTimeString()})`
          : '';
        toast.error(`Time slot unavailable${when}`);
      } else {
        const message =
          error instanceof AxiosError
            ? error.response?.data?.message || 'Failed to create booking'
            : 'Failed to create booking';
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> New Booking
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book a Resource</DialogTitle>
          <DialogDescription>
            Reserve a bookable asset. Overlapping time slots are automatically rejected.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="asset_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a bookable resource" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bookableAssets.map((a) => (
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_datetime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_datetime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Client meeting" {...field} />
                  </FormControl>
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
                Confirm Booking
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
