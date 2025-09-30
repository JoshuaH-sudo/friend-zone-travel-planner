'use client';

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAddTransportToDestination from '../../hooks/useAddTransportToDestination';
import useEditTransport from '../../hooks/useEditTransport';

// Transport form schema
const transportSchema = z.object({
  id: z.string().optional(),
  destinationId: z.string(),
  name: z.string().optional(), // Only for edit operations
  address: z.string().nullable().default(null),
  cost: z.number().min(0, 'Cost must be positive').default(0),
  currency: z.string().default('USD'),
  href: z.string().optional().nullable(),
  type: z.enum(['airplane', 'bus', 'car', 'train', 'ferry', 'other']).default('airplane'),
  departureAt: z.date().nullable().default(null),
  arrivalAt: z.date().nullable().default(null),
});

export type TransportFormType = z.infer<typeof transportSchema>;

export interface TransportFormProps {
  destinationId: string;
  routeId: string;
  initialData?: Partial<TransportFormType>;
  destinationStartDate: Date;
  onSuccess?: () => void;
}

const TransportForm: FC<TransportFormProps> = ({
  destinationId,
  routeId: _routeId,
  initialData,
  destinationStartDate,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  
  const defaultValues: TransportFormType = {
    destinationId,
    address: null,
    cost: 0,
    currency: 'USD',
    href: null,
    type: 'airplane',
    departureAt: null,
    arrivalAt: null,
    ...initialData,
  };

  const form = useForm<TransportFormType>({
    resolver: zodResolver(transportSchema),
    defaultValues,
    mode: 'onChange',
  });
  
  const { watch, handleSubmit } = form;
  const departureAt = watch('departureAt');

  // Mutation hooks
  const { mutateAsync: addTransport } = useAddTransportToDestination({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['destinations', destinationId],
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error adding transport:', error);
    },
  });

  const { mutateAsync: editTransportMutation } = useEditTransport({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['destinations', destinationId],
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error updating transport:', error);
    },
  });

  const onSubmit = async (data: TransportFormType) => {
    try {
      if (data.id && data.name) {
        // Edit existing transport
        await editTransportMutation({
          ...data,
          id: data.id,
          name: data.name,
          address: data.address ?? null,
          href: data.href ?? null,
        });
      } else {
        // Create new transport
        const { id: _id, name: _name, ...createData } = data;
        await addTransport({
          ...createData,
          address: createData.address ?? null,
          href: createData.href ?? null,
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const numberInputTransform = {
    input: (value: number) =>
      isNaN(value) || value === 0 ? '' : value.toString(),
    output: (e: React.ChangeEvent<HTMLInputElement>) => {
      const output = parseInt(e.target.value, 10);
      return isNaN(output) ? 0 : output;
    },
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>
              {initialData?.id ? 'Edit Transport Details' : 'Add Transport Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {initialData?.id && (
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Airline/Company name' {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Station Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Airport, Station, etc.'
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex flex-row gap-4'>
                <FormField
                  control={form.control}
                  name='cost'
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Cost</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          step='0.01'
                          {...field}
                          onChange={(e) =>
                            field.onChange(numberInputTransform.output(e))
                          }
                          value={numberInputTransform.input(field.value as number)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='currency'
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Currency' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='USD'>USD ($)</SelectItem>
                          <SelectItem value='EUR'>EUR (€)</SelectItem>
                          <SelectItem value='GBP'>GBP (£)</SelectItem>
                          <SelectItem value='JPY'>JPY (¥)</SelectItem>
                          <SelectItem value='AUD'>AUD (A$)</SelectItem>
                          <SelectItem value='CAD'>CAD (C$)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='href'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://example.com'
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Link to booking website or more information
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transport Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select transport type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='airplane'>Airplane</SelectItem>
                        <SelectItem value='bus'>Bus</SelectItem>
                        <SelectItem value='car'>Car</SelectItem>
                        <SelectItem value='train'>Train</SelectItem>
                        <SelectItem value='ferry'>Ferry</SelectItem>
                        <SelectItem value='other'>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='departureAt'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Departure Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className='w-full pl-3 text-left font-normal'
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value as Date | undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < destinationStartDate
                            }
                            defaultMonth={field.value as Date || destinationStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='arrivalAt'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Arrival Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className='w-full pl-3 text-left font-normal'
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value as Date | undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < (departureAt || destinationStartDate)
                            }
                            defaultMonth={field.value as Date || departureAt || destinationStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Button type="submit" className="w-full">
          {initialData?.id ? 'Update Transport' : 'Add Transport'}
        </Button>
      </form>
    </Form>
  );
};

export default TransportForm;