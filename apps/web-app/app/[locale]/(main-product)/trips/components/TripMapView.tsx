'use client';
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
} from '@vis.gl/react-google-maps';
import { FC, useEffect, useState } from 'react';
import { TripWithRoutes } from '@/lib/hooks/useGetTripsWithRoutes';

export type Poi = { key: string; location: google.maps.LatLngLiteral };

interface TripMapViewProps {
  trip: TripWithRoutes;
  selectedRouteId?: number;
}

const TripMapView: FC<TripMapViewProps> = ({ trip, selectedRouteId }) => {
  const selectedRoute = selectedRouteId 
    ? trip.routes.find(route => route.id === selectedRouteId) 
    : trip.routes[0];
  
  const locations: Poi[] = selectedRoute?.destinations.map((destination) => ({
    key: `${destination.id}-${destination.location}`,
    location: {
      lat: destination.latitude,
      lng: destination.longitude,
    },
  })) || [];

  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral>({
    lat: 0,
    lng: 0,
  });

  useEffect(() => {
    window.navigator.geolocation.getCurrentPosition(
      (position) =>
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () => setUserLocation({ lat: 0, lng: 0 }) // Fallback if geolocation fails
    );
  }, []);

  // Calculate center point of all destinations or use user location as fallback
  const centerLocation: google.maps.LatLngLiteral = (() => {
    if (locations.length === 0) {
      return userLocation;
    }
    
    if (locations.length === 1) {
      return locations[0].location;
    }

    const avgLat = locations.reduce((sum, loc) => sum + loc.location.lat, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.location.lng, 0) / locations.length;
    
    return { lat: avgLat, lng: avgLng };
  })();

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden border bg-background">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <Map
          key={`${centerLocation.lat}-${centerLocation.lng}-${locations.length}`}
          mapId='e8e51ecff87a146cf2857bda'
          style={{ width: '100%', height: '100%' }}
          defaultCenter={centerLocation}
          defaultZoom={locations.length > 1 ? 10 : 13}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          <PoiMarkers pois={locations} />
        </Map>
      </APIProvider>
      
      {/* Trip info overlay */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
        <h3 className="text-foreground font-semibold text-sm">{trip.name}</h3>
        {selectedRoute && (
          <p className="text-muted-foreground text-xs mt-1">
            {selectedRoute.name} • {selectedRoute.destinationCount} destinations
          </p>
        )}
      </div>
    </div>
  );
};

const PoiMarkers = (props: { pois: Poi[] }) => {
  return (
    <>
      {props.pois.map((poi, index) => (
        <AdvancedMarker key={poi.key} position={poi.location}>
          <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold shadow-lg">
            {index + 1}
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
};

export default TripMapView;
