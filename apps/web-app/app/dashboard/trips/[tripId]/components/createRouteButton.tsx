'use client';

import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createRoute } from '../actions/createRoute';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TripByIdResponse } from '../../actions/getTripById';

export interface CreateRouteButtonProps {
  trip: TripByIdResponse;
}

const CreateRouteButton = ({ trip }: CreateRouteButtonProps) => {
  const [open, setOpen] = useState(false);
  const [routeName, setRouteName] = useState('New Route');

  const createRouteHandler = async () => {
    await createRoute({
      name: routeName,
      trip_id: trip.id,
    });
    setOpen(false);
    redirect(`./${trip.id}`);
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
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='route-name'>Route Name</Label>
            <Input
              id='route-name'
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder='Enter route name'
            />
          </div>
          <Button onClick={createRouteHandler} className='w-full'>
            Create Route
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRouteButton;
