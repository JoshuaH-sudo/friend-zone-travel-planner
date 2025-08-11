'use client';

import { FC, useState } from 'react';
import AddDestinationForm from './addDestinationForm';
import DestinationList from './destinationsList';
import LocationMap, { Poi } from './locationMap';
import RouteNameInput from './routeNameInput';
import PricingPanel from './pricingPanel';

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
  tripId,
  initialRouteName,
  locations,
  previousDestination,
}) => {
  // State for sharing form data with pricing panel
  const [currentDestination, setCurrentDestination] = useState<{
    location?: string;
    checkInDate?: string;
    checkOutDate?: string;
  }>({});

  return (
    <div className='sm:h-[600px] w-[90%] px-12'>
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
        className='grid h-2/3 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
      >
        <div id='route-list' className='bg-card rounded-lg border p-2'>
          <DestinationList routeId={routeId} tripId={tripId} />
        </div>

        <div
          id='destination-details'
          className='bg-card flex flex-col gap-4 rounded-lg border p-2'
        >
          <AddDestinationForm
            routeId={routeId}
            onDestinationChange={setCurrentDestination}
          />
        </div>

        <div
          id='pricing-panel'
          className='bg-card h-full rounded-lg border p-2'
        >
          <PricingPanel
            location={currentDestination.location}
            checkInDate={currentDestination.checkInDate}
            checkOutDate={currentDestination.checkOutDate}
            previousDestination={previousDestination}
          />
        </div>

        <div id='map-overview' className='bg-card size-70 rounded-lg border'>
          <LocationMap locations={locations} />
        </div>
      </div>
    </div>
  );
};

export default RouteClientWrapper;
