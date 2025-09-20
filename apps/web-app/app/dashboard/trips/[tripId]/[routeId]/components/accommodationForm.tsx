'use client';

import { FC, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DestinationForm } from './addDestinationWorkflow';
import { DateRangeInput } from '@/components/ui/dateRangeInput';
import { DateRange } from 'react-day-picker';

const AccommodationForm: FC = () => {
  const form = useFormContext<DestinationForm>();
  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');
  
  // Create accommodation object with defaults if it doesn't exist
  useEffect(() => {
    if (!form.getValues('accommodation')) {
      form.setValue('accommodation', {
        name: '',
        address: '',
        cost: 0,
        currency: 'USD',
        href: '',
        type: 'hotel',
        check_in: startDate,
        check_out: endDate
      });
    }
  }, [form, startDate, endDate]);

  // Get current check-in/check-out values
  const accommodation = form.watch('accommodation');

  // Set up date range object for the picker
  const dateRange: DateRange = {
    from: accommodation?.check_in || startDate,
    to: accommodation?.check_out || endDate,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Add Accommodation Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <Form {...form}>
            <FormField
              control={form.control}
              name='accommodation.name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Hotel name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='accommodation.address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder='Address' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Check-in / Check-out Dates</FormLabel>
              <FormControl>
                <DateRangeInput
                  className='mb-2'
                  dates={dateRange}
                  onSelect={(dates) => {
                    if (dates?.from) {
                      form.setValue('accommodation.check_in', dates.from);
                    }
                    if (dates?.to) {
                      form.setValue('accommodation.check_out', dates.to);
                    }
                  }}
                  calendarProps={{
                    disabled: { 
                      before: startDate,
                    },
                    startMonth: startDate,
                    mode: 'range',
                  }}
                />
              </FormControl>
              <FormDescription>
                Select the check-in and check-out dates for your accommodation
              </FormDescription>
              <FormMessage />
            </FormItem>

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='accommodation.cost'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost per night</FormLabel>
                    <FormControl>
                      <Input type='number' min='0' step='0.01' {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='accommodation.currency'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select currency' />
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
              name='accommodation.href'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='https://example.com' {...field} value={field.value || ''} />
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
              name='accommodation.type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accommodation Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='hotel'>Hotel</SelectItem>
                      <SelectItem value='motel'>Motel</SelectItem>
                      <SelectItem value='hostel'>Hostel</SelectItem>
                      <SelectItem value='airbnb'>Airbnb</SelectItem>
                      <SelectItem value='friend'>Friend's Place</SelectItem>
                      <SelectItem value='other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccommodationForm;
