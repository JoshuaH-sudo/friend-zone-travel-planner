import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { TripByIdResponse } from '../../hooks/useGetTripById';

interface TripHeaderProps {
  trip: TripByIdResponse;
}

const TripHeader = ({ trip }: TripHeaderProps) => {
  const formattedStartDate = format(trip.start_date, 'MMM d, yyyy');
  const formattedEndDate = format(trip.end_date, 'MMM d, yyyy');

  const tripDuration = `${differenceInDays(trip.end_date, trip.start_date)} day${differenceInDays(trip.end_date, trip.start_date) !== 1 ? 's' : ''}`;

  return (
    <div className='border-b'>
      <div className='mx-auto max-w-7xl px-4 py-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex-1'>
            <div className='mb-2 flex items-center gap-3'>
              <MapPin className='h-6 w-6 text-blue-600' />
              <h1 className='text-3xl font-bold'>{trip.name}</h1>
            </div>

            <div className='flex flex-wrap items-center gap-4 text-sm'>
              <div className='flex items-center gap-2'>
                <CalendarDays className='h-4 w-4' />
                <span>
                  {formattedStartDate} - {formattedEndDate}
                </span>
              </div>
              <Badge variant='secondary' className='text-xs'>
                {tripDuration}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripHeader;
