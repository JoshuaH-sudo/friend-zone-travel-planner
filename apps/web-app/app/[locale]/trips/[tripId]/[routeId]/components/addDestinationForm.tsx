'use client';

import { DatePickerWithRange } from '@/components/ui/datePickerWithRange';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Destination, Friend } from '@/lib/generated/prisma';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import addDestination from '../actions/addDestination';

export type NewDestination = Omit<Destination, 'id'>;

export interface AddDestinationFormProps {
  routeId: number;
  friends: Friend[];
  currentOrder?: number;
}

const AddDestinationForm: FC<AddDestinationFormProps> = ({
  routeId,
  friends,
  currentOrder = 0,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewDestination>({
    defaultValues: {
      location: '',
      order: currentOrder + 1,
      routeId,
    },
  });

  const onSubmit = async (data: NewDestination) => {
    console.log('Form submitted with data:', data);
    await addDestination(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex h-full flex-col gap-1'>
      <div>
        <p>Destination</p>
        <Input
          placeholder={'Berlin'}
          className='w-full'
          {...register('location')}
        />
      </div>
      <p>
        {JSON.stringify(errors)}
      </p>

      <div>
        <p>Dates</p>
        <DatePickerWithRange />
      </div>

      <div className='h-1/3'>
        <p>Friends To See</p>
        <ScrollArea>
          {friends.map((friend) => (
            <div
              key={friend.id}
              className='cursor-pointer rounded-lg bg-gray-200 p-2 text-black transition-colors duration-200 hover:bg-red-400 my-2'
            >
              {friend.name}
            </div>
          ))}
        </ScrollArea>
      </div>

      <button
        id='add-destination'
        className='w-full rounded-lg bg-green-500 p-2 text-white transition-colors duration-200 hover:bg-green-600 disabled:opacity-50'
        type='submit'
        disabled={!errors}
      >
        Add
      </button>
    </form>
  );
};

export default AddDestinationForm;
