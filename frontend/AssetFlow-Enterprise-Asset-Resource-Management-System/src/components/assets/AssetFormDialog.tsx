'use client';

import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
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
import { Switch } from '@/components/ui/switch';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { assetApi } from '@/services/api/asset.api';
import { categoryApi } from '@/services/api/category.api';

const assetSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category_id: z.string().min(1, 'Category is required'),
  serial_number: z.string().optional(),
  location: z.string().optional(),
  condition: z.enum(['New', 'Good', 'Fair', 'Poor']),
  acquisition_cost: z.coerce.number().min(0, 'Cost must be positive').optional(),
  is_bookable: z.boolean(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

const LOCATIONS = ['HQ - Floor 1', 'HQ - Floor 2', 'HQ - Floor 3', 'Warehouse A', 'Remote'];

interface AssetFormDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AssetFormDialog({ trigger, onSuccess }: AssetFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.list,
    enabled: open, // only fetch when the dialog is opened
  });

  const form = useForm<AssetFormValues>({
    // Cast avoids the well-known zod-coerce/RHF resolver generic mismatch.
    resolver: zodResolver(assetSchema) as Resolver<AssetFormValues>,
    defaultValues: {
      name: '',
      category_id: '',
      serial_number: '',
      location: '',
      condition: 'New',
      acquisition_cost: 0,
      is_bookable: false,
    },
  });

  async function onSubmit(values: AssetFormValues) {
    setIsLoading(true);
    try {
      const asset = await assetApi.create({
        name: values.name,
        category_id: values.category_id,
        serial_number: values.serial_number || undefined,
        location: values.location || undefined,
        condition: values.condition,
        acquisition_cost: values.acquisition_cost,
        is_bookable: values.is_bookable,
      });
      toast.success(`Asset ${asset.asset_tag} created`);
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || 'Failed to create asset'
          : 'Failed to create asset';
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
            <Plus className="mr-2 h-4 w-4" /> Add Asset
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            Register a new asset. A unique tag (AF-XXXX) is generated automatically.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Asset Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. MacBook Pro 16&quot;" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOCATIONS.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
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
                name="serial_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl>
                      <Input placeholder="SN-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['New', 'Good', 'Fair', 'Poor'].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
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
                name="acquisition_cost"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Acquisition Cost ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_bookable"
                render={({ field }) => (
                  <FormItem className="col-span-2 flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Bookable Resource</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Can this asset be reserved via the booking calendar?
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

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
                Create Asset
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
