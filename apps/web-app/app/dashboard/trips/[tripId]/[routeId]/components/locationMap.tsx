'use client';
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
} from '@vis.gl/react-google-maps';
import { FC, useEffect, useState } from 'react';

export type Poi = { key: string; location: google.maps.LatLngLiteral };

interface LocationMapProps {
  locations: Poi[];
}
const LocationMap: FC<LocationMapProps> = ({ locations }) => {
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

  const lastDestination = locations[locations.length - 1];
  const lastPosition: google.maps.LatLngLiteral = {
    lat: lastDestination?.location.lat || userLocation.lat,
    lng: lastDestination?.location.lng || userLocation.lng,
  };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <Map
        // Force re-render when user location changes
        key={lastPosition.lat + lastPosition.lng}
        mapId='e8e51ecff87a146cf2857bda'
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '0.65rem',
          overflow: 'hidden',
        }}
        defaultCenter={lastPosition}
        defaultZoom={13}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        <PoiMarkers pois={locations} />
      </Map>
    </APIProvider>
  );
};

const PoiMarkers = (props: { pois: Poi[] }) => {
  return (
    <>
      {props.pois.map((poi, index) => (
        <AdvancedMarker key={poi.key} position={poi.location}>
          <h1>{index}</h1>
          <Pin
            background={'#FBBC04'}
            glyphColor={'#000'}
            borderColor={'#000'}
          />
        </AdvancedMarker>
      ))}
    </>
  );
};

export default LocationMap;
