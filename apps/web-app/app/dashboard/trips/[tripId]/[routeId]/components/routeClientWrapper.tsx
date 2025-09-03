'use client';

import { FC } from 'react';
import AddDestinationWorkflow from './addDestinationWorkflow';
import DestinationList from './destinationsList';
import LocationMap from './locationMap';
import RouteNameInput from './routeNameInput';
import useGetRouteById from '../../hooks/useGetRouteById';

export interface RouteClientWrapperProps {
  tripId: string;
  routeId: string;
}

const RouteClientWrapper: FC<RouteClientWrapperProps> = ({ routeId }) => {
  const { data: route } = useGetRouteById({
    routeId,
  });

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
  const previousDestination =
    route.destinations.length > 0
      ? route.destinations[route.destinations.length - 1]
      : undefined;

  return (
    <div className='min-h-screen sm:h-[600px]'>
      <div
        id='trip-details'
        className='grid h-2/3 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
      >
        <div className='flex flex-col gap-4'>
          <RouteNameInput routeId={route.id} initialName={route.name} />

          <div id='route-list' className='bg-card grow rounded-lg border p-2'>
            <DestinationList routeId={route.id} />
          </div>
        </div>

        <div
          id='destination-details'
          className='bg-card flex flex-col gap-4 rounded-lg border p-2'
        >
          <AddDestinationWorkflow
            routeId={route.id}
            previousDestination={previousDestination}
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
