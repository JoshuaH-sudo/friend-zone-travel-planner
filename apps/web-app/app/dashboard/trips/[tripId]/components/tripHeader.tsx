import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin } from 'lucide-react';
import { format, formatDistance } from 'date-fns';
import { TripByIdResponse } from '../../hooks/useGetTripById';
import { DateRangeInput } from '@/components/ui/dateRangeInput';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import useUpdateTrip from '../../hooks/useUpdateTrip';

interface TripHeaderProps {
  trip: TripByIdResponse;
}

const TripHeader = ({ trip }: TripHeaderProps) => {
  const [dates, setDates] = useState<DateRange>({
    from: new Date(trip.start_date),
    to: new Date(trip.end_date)
  });
  const { mutate: updateTrip, isPending } = useUpdateTrip({
    onSuccess: () => {
      // Simple alert instead of toast
      console.log('Trip dates updated successfully');
    },
    onError: (error) => {
      console.error(`Failed to update trip dates: ${error.message}`);
    }
  });
  
  const formattedStartDate = format(trip.start_date, 'MMM d, yyyy');
  const formattedEndDate = format(trip.end_date, 'MMM d, yyyy');
  const tripDuration = formatDistance(trip.start_date, trip.end_date);

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
              <DateRangeInput
                className='mb-4'
                dates={dates}
                onSelect={(newDates) => {
                  if (newDates?.from && newDates?.to) {
                    setDates(newDates);
                    updateTrip({
                      tripId: trip.id,
                      startDate: newDates.from,
                      endDate: newDates.to
                    });
                  }
                }}
                label='Trip Dates'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripHeader;
