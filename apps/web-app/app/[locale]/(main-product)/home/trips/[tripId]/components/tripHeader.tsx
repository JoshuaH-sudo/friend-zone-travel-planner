import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin } from 'lucide-react';

interface Trip {
  id: string;
  name: string;
  startDate?: Date;
  endDate?: Date;
}

interface TripHeaderProps {
  trip: Trip;
}

const TripHeader = ({ trip }: TripHeaderProps) => {
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Not set';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getDuration = () => {
    if (!trip.startDate || !trip.endDate) return null;
    const diffTime = Math.abs(
      trip.endDate.getTime() - trip.startDate.getTime()
    );
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

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
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </span>
              </div>
              {getDuration() && (
                <Badge variant='secondary' className='text-xs'>
                  {getDuration()}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripHeader;
