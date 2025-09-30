'use client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, Edit, Trash2 } from 'lucide-react';
import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import deleteDestination from '../actions/deleteDestination';
import { format } from 'date-fns';
import { TripByIdResponse } from '../../actions/getTripById';

export interface DestinationListProps {
  route: TripByIdResponse['routes'][0];
  onDestinationSelect: (
    destinationId: TripByIdResponse['routes'][0]['destinations'][0]
  ) => void;
}

const DestinationList: FC<DestinationListProps> = ({
  route,
  onDestinationSelect,
}) => {
  const queryClient = useQueryClient();
  const [selectedDestinationId, setSelectedDestinationId] = useState<
    string | null
  >(null);

  const { mutateAsync } = useMutation({
    mutationFn: async (destinationId: string) => {
      return deleteDestination(destinationId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['destinations', route.id],
      });
    },
    onError: (error) => {
      console.error('Error deleting destination:', error);
    },
  });

  const onItemClick = (
    destination: TripByIdResponse['routes'][0]['destinations'][0]
  ) => {
    setSelectedDestinationId(
      destination.id === selectedDestinationId ? null : destination.id
    );
    onDestinationSelect(destination);
  };

  return (
    <ScrollArea className='h-full py-2'>
      {route.destinations.map((destination, index) => (
        <div key={destination.id} className='flex flex-col items-center'>
          <div
            className='group relative flex w-full flex-row items-center gap-2'
            onClick={() => onItemClick(destination)}
          >
            <div className='flex size-8 items-center justify-center rounded-full bg-gray-200 text-black'>
              {destination.order}
            </div>

            <div
              id='destination-card'
              className={`flex flex-1 cursor-pointer flex-row gap-2 rounded-lg p-2 px-4 text-sm transition-all duration-300 ease-in-out group-hover:mr-20 ${
                selectedDestinationId === destination.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : selectedDestinationId
                    ? 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    : 'bg-gray-200 text-black hover:bg-blue-400'
              }`}
            >
              <p className='flex-1'>{destination.location}</p>
              <p>
                {format(destination.start_date, 'MMM d')} -{' '}
                {format(destination.end_date, 'MMM d')}
              </p>
              <p className='font-bold'>{destination.days} days</p>
            </div>

            <div
              id='action-buttons'
              className='absolute right-1 flex gap-1 opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100'
            >
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 bg-white shadow-sm hover:bg-blue-400'
                title='Edit destination'
              >
                <Edit className='h-4 w-4 text-gray-600' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 bg-white shadow-sm hover:bg-blue-400'
                onClick={() => mutateAsync(destination.id)}
                title='Delete destination'
              >
                <Trash2 className='h-4 w-4 text-gray-600 hover:text-red-600' />
              </Button>
            </div>
          </div>
          {index < route.destinations.length - 1 && (
            <ChevronDown
              key={`dot-${index}`}
              className='mx-auto size-6 text-black'
            />
          )}
        </div>
      ))}
    </ScrollArea>
  );
};

export default DestinationList;
