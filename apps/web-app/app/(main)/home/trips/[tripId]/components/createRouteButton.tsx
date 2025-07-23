'use client';

import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import createRoute from '../actions/createRoute';

const CreateRouteButton = ({ tripId }: { tripId: string }) => {
  const createRouteHandler = async () => {
    const newRoute = await createRoute(tripId);
    redirect(`./${tripId}/${newRoute.id}`);
  };

  return (
    <Button onClick={createRouteHandler} className='gap-2' size='sm'>
      <Plus className='h-4 w-4' />
      Add Route
    </Button>
  );
};
export default CreateRouteButton;
