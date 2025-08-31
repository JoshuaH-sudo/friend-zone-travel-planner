'use client';

import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createRoute } from '../actions/createRoute';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateRangeInput } from '@/components/ui/dateRangeInput';
import { DateRange } from 'react-day-picker';
import { TripByIdResponse } from '../../hooks/useGetTripById';

export interface CreateRouteButtonProps {
  trip: TripByIdResponse;
}

const CreateRouteButton = ({ trip }: CreateRouteButtonProps) => {
  const [open, setOpen] = useState(false);
  const [routeName, setRouteName] = useState('New Route');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(trip.start_date),
    to: new Date(trip.end_date)
  });

  const createRouteHandler = async () => {
    const newRoute = await createRoute({
      name: routeName,
      tripId: trip.id,
      dateFrom: dateRange?.from,
      dateTo: dateRange?.to,
    });
    setOpen(false);
    redirect(`./${trip.id}/${newRoute.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='gap-2' size='sm'>
          <Plus className='h-4 w-4' />
          Add Route
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Route</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="route-name">Route Name</Label>
            <Input
              id="route-name"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="Enter route name"
            />
          </div>
          <div className="grid gap-2">
            <DateRangeInput
              dates={dateRange}
              onSelect={setDateRange}
              label="Route Duration"
            />
          </div>
          <Button onClick={createRouteHandler} className="w-full">
            Create Route
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRouteButton;

