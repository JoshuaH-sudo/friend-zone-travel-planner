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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

const TransportForm: FC = () => {
  const form = useFormContext<DestinationForm>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Add Transport Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <Form {...form}>
            <FormField
              control={form.control}
              name='transport.name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Airline/Company name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='transport.address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Station Address</FormLabel>
                  <FormControl>
                    <Input placeholder='BER Airport' {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='transport.cost'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost</FormLabel>
                    <FormControl>
                      <Input type='number' min='0' step='0.01' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='transport.currency'
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
              name='transport.href'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='https://example.com' {...field} value={field.value ?? ''} />
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
              name='transport.type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transport Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select type' />
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
                name='transport.departureAt'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Departure Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`pl-3 text-left font-normal ${!field.value ? 'text-muted-foreground' : ''}`}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
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
                name='transport.arrivalAt'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Arrival Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`pl-3 text-left font-normal ${!field.value ? 'text-muted-foreground' : ''}`}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransportForm;
