'use client';

import { FC, useState } from 'react';
import AddDestinationWorkflow, { DestinationForm } from './addDestinationWorkflow';
import DestinationList from './destinationsList';
import LocationMap from './locationMap';
import RouteNameInput from './routeNameInput';
import useGetRouteById from '../../hooks/useGetRouteById';
import { FullDestination } from '@/lib/hooks/useGetDestinationsByRouteId';

export interface RouteClientWrapperProps {
  tripId: string;
  routeId: string;
}

const RouteClientWrapper: FC<RouteClientWrapperProps> = ({ routeId }) => {
  const { data: route } = useGetRouteById({
    routeId,
  });
  const [destinationToEdit, setDestinationToEdit] = useState<DestinationForm>();
  const onDestinationSelect = (destination: FullDestination) => {
    setDestinationToEdit({
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
      //@ts-expect-error - accommodation type is checked in the DB schema
      accommodation: destination.accommodations[0] || undefined,
      //@ts-expect-error - transport type is checked in the DB schema
      transport: destination.transports[0] || undefined,
    });
  };

  if (!route) {
    return <div>Loading...</div>;
  }

  const locations = route.destinations.map((destination) => ({
    key: destination.id,
    location: {
      lat: destination.latitude,
      lng: destination.longitude,
    },
  }));

  // Get the most recent destination to use as previous destination for transport
  // If editing an existing destination, use the destination that comes before it in the route
  // If adding a new destination, use the last destination in the route
  // If no destinations exist, return undefined
  const previousDestination = destinationToEdit
    ? route.destinations[route.destinations.findIndex(d => d.id === destinationToEdit.id) - 1]
    : route.destinations.length > 0
    ? route.destinations[route.destinations.length - 1]
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
            <DestinationList route={route} onDestinationSelect={onDestinationSelect} />
          </div>
        </div>

        <div
          id='destination-details'
          className='bg-card flex flex-col gap-4 rounded-lg border p-2'
        >
          <AddDestinationWorkflow
            route={route}
            previousDestination={previousDestination}
            destinationToEdit={destinationToEdit}
            onEditComplete={() => setDestinationToEdit(undefined)}
          />
        </div>

        <div id='map-overview' className='bg-card rounded-lg border'>
          <LocationMap locations={locations} />
        </div>
      </div>
    </div>
  );
};

export default RouteClientWrapper;
