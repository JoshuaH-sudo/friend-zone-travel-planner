'use client';

import { FC, useState } from 'react';
import DestinationForm, {
  DestinationFormType,
} from '../../components/forms/destinationForm';
import DestinationList from '../../components/destinationsList';
import RouteNameInput from './routeNameInput';
import useGetRouteById from '../../hooks/useGetRouteById';
import { FullDestination } from '@/lib/hooks/useGetDestinationsByRouteId';

export interface RouteClientWrapperProps {
  tripId: string;
  routeId: string;
}

const parseTransport = (
  transportData: FullDestination['transports'][0]
): DestinationFormType['transport'] => {
  return {
    id: transportData.id,
    name: transportData.name,
    // @ts-expect-error the type will match the enum in the backend
    type: transportData.type,
    departureAt: transportData.departure_at
      ? new Date(transportData.departure_at)
      : null,
    arrivalAt: transportData.arrival_at
      ? new Date(transportData.arrival_at)
      : null,
    cost: transportData.cost,
    currency: transportData.currency,
    address: transportData.address,
    href: transportData.href,
    createdAt: transportData.created_at
      ? new Date(transportData.created_at)
      : null,
    updatedAt: transportData.updated_at
      ? new Date(transportData.updated_at)
      : null,
  };
};

const parseAccommodation = (
  accommodationData: FullDestination['accommodations'][0]
): DestinationFormType['accommodation'] => {
  return {
    id: accommodationData.id,
    name: accommodationData.name,
    address: accommodationData.address,
    // @ts-expect-error the type will match the enum in the backend
    type: accommodationData.type,
    cost: accommodationData.cost,
    currency: accommodationData.currency,
    href: accommodationData.href,
    checkIn: accommodationData.check_in
      ? new Date(accommodationData.check_in)
      : null,
    checkOut: accommodationData.check_out
      ? new Date(accommodationData.check_out)
      : null,
    createdAt: accommodationData.created_at
      ? new Date(accommodationData.created_at)
      : undefined,
    updatedAt: accommodationData.updated_at
      ? new Date(accommodationData.updated_at)
      : undefined,
  };
};

const parseDestination = (
  destination: Omit<FullDestination, 'routes'>
): DestinationFormType => {
  return {
    id: destination.id,
    routeId: destination.route_id,
    location: destination.location,
    latitude: destination.latitude,
    longitude: destination.longitude,
    startDate: new Date(destination.start_date),
    endDate: new Date(destination.end_date),
    days: destination.days,
    order: destination.order,
    stayingWithFriend: destination.friends.length > 0,
    friendIds: destination.friends.map((friend) => friend.id),
    accommodation: parseAccommodation(destination.accommodations[0]),
    transport: parseTransport(destination.transports[0]),
  };
};

const RouteClientWrapper: FC<RouteClientWrapperProps> = ({ routeId }) => {
  const { data: route } = useGetRouteById({
    routeId,
  });
  const [destinationToEdit, setDestinationToEdit] =
    useState<DestinationFormType>();
  const onDestinationSelect = (destination: FullDestination) => {
    setDestinationToEdit({
      ...parseDestination(destination),
    });
  };

  if (!route) {
    return <div>Loading...</div>;
  }

  // Get the most recent destination to use as previous destination for transport
  // If editing an existing destination, use the destination that comes before it in the route
  // If adding a new destination, use the last destination in the route
  // If no destinations exist, return undefined
  const previousDestination = destinationToEdit
    ? route.destinations[
        route.destinations.findIndex((d) => d.id === destinationToEdit.id) - 1
      ]
    : route.destinations.length > 0
      ? route.destinations[route.destinations.length - 1]
      : undefined;

  const parsedPreviousDestination = previousDestination
    ? parseDestination(previousDestination)
    : undefined;
  return (
    <div className='min-h-screen sm:h-[600px]'>
      <div
        id='trip-details'
        className='grid h-2/3 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
      >
        <div className='flex flex-col gap-4'>
          <RouteNameInput route={route} initialName={route.name} />

          <div id='route-list' className='bg-card grow rounded-lg border p-2'>
            <DestinationList
              route={route}
              onDestinationSelect={onDestinationSelect}
            />
          </div>
        </div>

        <div
          id='destination-details'
          className='bg-card col-span-2 flex flex-col gap-4 rounded-lg border p-2'
        >
          <DestinationForm
            route={route}
            previousDestination={parsedPreviousDestination}
            destinationToEdit={destinationToEdit}
            onEditComplete={() => setDestinationToEdit(undefined)}
          />
        </div>
      </div>
    </div>
  );
};

export default RouteClientWrapper;
