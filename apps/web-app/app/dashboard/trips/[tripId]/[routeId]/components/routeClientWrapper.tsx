'use client';

import { FC } from 'react';
import AddDestinationWorkflow from './addDestinationWorkflow';
import DestinationList from './destinationsList';
import LocationMap, { Poi } from './locationMap';
import RouteNameInput from './routeNameInput';

export interface RouteClientWrapperProps {
  routeId: string;
  tripId: string;
  initialRouteName: string;
  locations: Poi[];
  previousDestination?: {
    location: string;
    latitude: number;
    longitude: number;
  };
}

const RouteClientWrapper: FC<RouteClientWrapperProps> = ({
  routeId,
  initialRouteName,
  locations,
  previousDestination,
}) => {
  return (
    <div className='min-h-screen sm:h-[600px]'>
      <div
        id='trip-details'
        className='grid h-2/3 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
      >
        <div className='flex flex-col gap-4'>
          <RouteNameInput routeId={routeId} initialName={initialRouteName} />

          <div id='route-list' className='bg-card grow rounded-lg border p-2'>
            <DestinationList routeId={routeId} />
          </div>
        </div>

        <div
          id='destination-details'
          className='bg-card flex flex-col gap-4 rounded-lg border p-2'
        >
          <AddDestinationWorkflow
            routeId={routeId}
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
