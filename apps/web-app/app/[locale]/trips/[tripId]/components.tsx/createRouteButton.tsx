'use client';

import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import createRoute from '../actions/createRoute';

const CreateRouteButton = ({ tripId }: { tripId: string }) => {
  const createRouteHandler = async () => {
    await createRoute(parseInt(tripId, 10));
    redirect(`./${tripId}`);
  };

  return (
    <Button onClick={createRouteHandler} className='mt-4'>
      Add Route
    </Button>
  );
};
export default CreateRouteButton;
