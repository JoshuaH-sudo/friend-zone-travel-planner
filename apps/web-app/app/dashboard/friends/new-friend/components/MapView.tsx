'use client';
import { AdvancedMarker, APIProvider, Map } from '@vis.gl/react-google-maps';
import { FC, useMemo } from 'react';

export type Poi = { key: string; location: google.maps.LatLngLiteral };

interface MapViewProps {
  locations: Poi[];
}

const MapView: FC<MapViewProps> = ({ locations }) => {
  // Calculate center point of all destinations or use user location as fallback
  const centerLocation: google.maps.LatLngLiteral = useMemo(() => {
    if (locations.length === 0) {
      return { lat: 0, lng: 0 };
    }

    if (locations.length === 1) {
      return locations[0].location;
    }

    const avgLat =
      locations.reduce((sum, loc) => sum + loc.location.lat, 0) /
      locations.length;
    const avgLng =
      locations.reduce((sum, loc) => sum + loc.location.lng, 0) /
      locations.length;

    return { lat: avgLat, lng: avgLng };
  }, [locations]);

  return (
    <div className='bg-background flex h-full min-h-[400px] w-full justify-center overflow-hidden rounded-lg border'>
      {locations.length === 0 && (
        <h1 className='text-gray-500'>
          No locations to display. Please add a friend with a valid address.
        </h1>
      )}
      {locations.length > 0 && (
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
      )}
    </div>
  );
};

const PoiMarkers = (props: { pois: Poi[] }) => {
  return (
    <>
      {props.pois.map((poi, index) => (
        <AdvancedMarker key={poi.key} position={poi.location}>
          <div className='bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold shadow-lg'>
            {index + 1}
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
};

export default MapView;
