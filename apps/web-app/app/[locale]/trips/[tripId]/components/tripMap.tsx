'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, Navigation, MapPin } from 'lucide-react';
import {
  AdvancedMarker,
  APIProvider,
  Map as GoogleMap,
  Pin,
} from '@vis.gl/react-google-maps';
import useGetDestinationsByRouteId from '@/lib/hooks/useGetDestinationsByRouteId';
import { useEffect, useState } from 'react';

export type Poi = { key: string; location: google.maps.LatLngLiteral };

interface Route {
  id: number;
  name: string;
}

interface TripMapProps {
  selectedRouteId: number | null;
  routes: Route[];
}

const TripMap = ({ selectedRouteId, routes }: TripMapProps) => {
  const { data: destinations = [] } = useGetDestinationsByRouteId(selectedRouteId || 0);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral>({
    lat: -37.8136, // Default to Melbourne
    lng: 144.9631,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }),
        () => {
          // Keep default location if geolocation fails
        }
      );
    }
  }, []);

  const locations: Poi[] = destinations.map((destination) => ({
    key: destination.location,
    location: {
      lat: destination.latitude,
      lng: destination.longitude,
    },
  }));

  // Calculate map center based on destinations or use user location
  const getMapCenter = (): google.maps.LatLngLiteral => {
    if (destinations.length === 0) {
      return userLocation;
    }

    if (destinations.length === 1) {
      return {
        lat: destinations[0].latitude,
        lng: destinations[0].longitude,
      };
    }

    // Calculate center of all destinations
    const avgLat = destinations.reduce((sum, dest) => sum + dest.latitude, 0) / destinations.length;
    const avgLng = destinations.reduce((sum, dest) => sum + dest.longitude, 0) / destinations.length;
    
    return { lat: avgLat, lng: avgLng };
  };

  const getMapZoom = (): number => {
    if (destinations.length === 0) return 10;
    if (destinations.length === 1) return 13;
    
    // Calculate zoom based on the spread of destinations
    const lats = destinations.map(d => d.latitude);
    const lngs = destinations.map(d => d.longitude);
    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const maxSpread = Math.max(latSpread, lngSpread);
    
    if (maxSpread > 10) return 5;
    if (maxSpread > 5) return 7;
    if (maxSpread > 1) return 9;
    return 11;
  };

  const selectedRoute = routes.find(route => route.id === selectedRouteId);

  return (
    <div className='space-y-4'>
      {/* Map Card */}
      <Card className='h-96'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Map className='h-5 w-5' />
            {selectedRoute ? `${selectedRoute.name} - Route Map` : 'Route Map'}
          </CardTitle>
        </CardHeader>
        <CardContent className='flex-1 p-0'>
          {selectedRouteId && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                key={`${selectedRouteId}-${destinations.length}`}
                mapId='e8e51ecff87a146cf2857bda'
                style={{ width: '100%', height: '100%', borderRadius: '0 0 8px 8px' }}
                center={getMapCenter()}
                zoom={getMapZoom()}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
              >
                <PoiMarkers pois={locations} />
              </GoogleMap>
            </APIProvider>
          ) : (
            <div className='h-full flex items-center justify-center'>
              <div className='text-center text-gray-500 p-6'>
                <div className='w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center'>
                  <Navigation className='h-12 w-12 text-gray-400' />
                </div>
                <p className='text-sm mb-2'>
                  {selectedRouteId 
                    ? 'Loading route destinations...' 
                    : 'Select a route to view destinations on the map'
                  }
                </p>
                <p className='text-xs text-gray-400'>
                  Click on a route card to display its destinations
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trip Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>
            {selectedRoute ? `${selectedRoute.name} Overview` : 'Trip Overview'}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div className='text-center p-3 bg-blue-50 rounded-lg'>
              <div className='font-semibold text-blue-900'>{routes.length}</div>
              <div className='text-blue-700'>Total Routes</div>
            </div>
            <div className='text-center p-3 bg-green-50 rounded-lg'>
              <div className='font-semibold text-green-900'>
                {selectedRouteId ? destinations.length : '?'}
              </div>
              <div className='text-green-700'>
                {selectedRouteId ? 'Route Destinations' : 'Destinations'}
              </div>
            </div>
          </div>
          
          {selectedRouteId && destinations.length > 0 && (
            <div className='pt-2 border-t border-gray-200'>
              <div className='text-xs text-gray-500 mb-2'>Destinations</div>
              <div className='space-y-2 max-h-32 overflow-y-auto'>
                {destinations.map((destination, index) => (
                  <div key={destination.id} className='flex items-center gap-2 text-sm'>
                    <div className='w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0'></div>
                    <span className='text-gray-600 truncate'>
                      {index + 1}. {destination.location}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!selectedRouteId && (
            <div className='pt-2 border-t border-gray-200'>
              <div className='text-xs text-gray-500 mb-2'>Quick Actions</div>
              <div className='space-y-2 text-sm'>
                <div className='flex items-center gap-2 text-gray-600'>
                  <MapPin className='w-4 h-4' />
                  <span>Select a route to view destinations</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const PoiMarkers = (props: { pois: Poi[] }) => {
  return (
    <>
      {props.pois.map((poi, index) => (
        <AdvancedMarker key={poi.key} position={poi.location}>
          <div className='flex items-center justify-center w-8 h-8 bg-yellow-500 text-black font-bold text-sm rounded-full border-2 border-white shadow-lg'>
            {index + 1}
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
};

export default TripMap;
