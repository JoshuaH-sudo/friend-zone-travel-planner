'use client';

import { FC } from 'react';
import AddDestinationForm from './addDestinationForm';
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
        id='route-name-section'
        className='mb-4 flex flex-row items-end justify-between gap-2'
      >
        <div className='grow space-y-2'>
          <RouteNameInput routeId={routeId} initialName={initialRouteName} />
        </div>
      </div>
      <div
        id='trip-details'
        className='grid h-2/3 gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      >
        <div
          id='route-list'
          className='bg-card rounded-lg border p-2'
        >
          <DestinationList routeId={routeId} />
        </div>

        <div
          id='destination-details'
          className='bg-card flex flex-col gap-4 rounded-lg border p-2'
        >
          <AddDestinationForm 
            routeId={routeId} 
            previousDestination={previousDestination}
          />
        </div>

        <div
          id='map-overview'
          className='bg-card rounded-lg border'
        >
          <LocationMap locations={locations} />
        </div>
      </div>
    </div>
  );
};

export default RouteClientWrapper;
