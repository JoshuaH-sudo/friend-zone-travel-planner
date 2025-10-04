'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import createTrip from '../actions/createTrip';
import { useRouter } from 'next/navigation';

interface CreateTripDialogProps {
  buttonText?: string;
  className?: string;
}

const CreateTripDialog = ({
  buttonText = 'Create New Trip',
  className,
}: CreateTripDialogProps) => {
  const [open, setOpen] = useState(false);
  const [tripName, setTripName] = useState('New Trip');
  const router = useRouter();

  const handleCreateTrip = async () => {
    const newTrip = await createTrip({
      name: tripName,
    });

    setOpen(false);
    router.push(`/dashboard/trips/${newTrip.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`gap-2 ${className}`}>
          <Plus className='h-4 w-4' />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='trip-name'>Trip Name</Label>
            <Input
              id='trip-name'
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder='Enter trip name'
            />
          </div>
          <Button
            onClick={handleCreateTrip}
            className='w-full'
            disabled={!tripName.trim()}
          >
            Create Trip
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTripDialog;
