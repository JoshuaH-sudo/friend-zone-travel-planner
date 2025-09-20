import { MapPin } from 'lucide-react';
import { TripByIdResponse } from '../../hooks/useGetTripById';
import { DateRangeInput } from '@/components/ui/dateRangeInput';
import { useState, useRef, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import useUpdateTrip from '../../hooks/useUpdateTrip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Edit, Loader2 } from 'lucide-react';

interface TripHeaderProps {
  trip: TripByIdResponse;
}

const TripHeader = ({ trip }: TripHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(trip.name);
  const [tempName, setTempName] = useState(trip.name);
  const [dates, setDates] = useState<DateRange>({
    from: new Date(trip.start_date),
    to: new Date(trip.end_date),
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const { mutate: updateTrip, isPending } = useUpdateTrip({
    onSuccess: () => {
      // Simple alert instead of toast
      console.log('Trip updated successfully');
      setName(tempName);
      setIsEditing(false);
    },
    onError: (error) => {
      console.error(`Failed to update trip: ${error.message}`);
      setTempName(name); // Revert to original name on error
    },
  });

  const handleSave = () => {
    if (tempName.trim() === '') {
      setTempName(name);
      setIsEditing(false);
      return;
    }

    updateTrip({
      tripId: trip.id,
      name: tempName.trim(),
      startDate: new Date(trip.start_date),
      endDate: new Date(trip.end_date),
    });
  };

  const handleCancel = () => {
    setTempName(name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Handle click outside to exit edit mode
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        if (isEditing && !isPending) {
          handleCancel();
        }
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, isPending]);

  const nameHasChanged = tempName !== trip.name;

  return (
    <div className='border-b'>
      <div className='mx-auto max-w-7xl px-4 py-2'>
        <div className='flex flex-col gap-2'>
          <div className='mb-2 flex items-center gap-3'>
            <MapPin className='h-6 w-6 text-blue-600' />
            <div>
              <div ref={containerRef} className='flex items-center gap-2'>
                {isEditing ? (
                  <>
                    <Input
                      id='trip-name'
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder='Enter trip name'
                      className='max-w-md text-3xl font-bold'
                      autoFocus
                      disabled={isPending}
                    />
                    <div className='animate-in slide-in-from-left-3 flex gap-1 duration-300 ease-out'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={handleSave}
                        disabled={isPending || !nameHasChanged}
                        className='transition-all duration-200 hover:scale-105'
                      >
                        {isPending ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <Check className='h-4 w-4' />
                        )}
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={handleCancel}
                        disabled={isPending}
                        className='transition-all duration-200 hover:scale-105'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h1
                      id='trip-name'
                      className='max-w-md cursor-pointer text-3xl font-bold'
                      onClick={() => setIsEditing(true)}
                    >
                      {name}
                    </h1>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => setIsEditing(true)}
                      className='transition-all duration-200 hover:scale-105'
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                  </>
                )}
              </div>
            </div>
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
                    name: name, // Keep existing name
                    startDate: newDates.from,
                    endDate: newDates.to,
                  });
                }
              }}
              label='Trip Dates'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripHeader;
