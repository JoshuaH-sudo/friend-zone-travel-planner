'use client';

import { useEffect, useRef } from 'react';
import { Friend } from '../hooks/useGetFriends';

interface FriendMapViewProps {
  friend: Friend;
}

const FriendMapView = ({ friend }: FriendMapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: friend.latitude, lng: friend.longitude },
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;

    // Create marker
    const marker = new window.google.maps.Marker({
      position: { lat: friend.latitude, lng: friend.longitude },
      map: map,
      title: friend.name,
      icon: {
        url:
          'data:image/svg+xml;charset=UTF-8,' +
          encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" stroke-width="3"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 16),
      },
    });

    markerRef.current = marker;

    // Create info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-semibold text-sm">${friend.name}</h3>
          <p class="text-xs text-gray-600 mt-1">${friend.location}</p>
        </div>
      `,
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [friend]);

  return (
    <div className='relative h-full w-full'>
      <div ref={mapRef} className='h-full w-full rounded-lg' />

      {/* Friend info overlay */}
      <div className='absolute top-4 left-4 max-w-xs rounded-lg bg-white p-3 shadow-lg'>
        <h3 className='text-sm font-semibold text-gray-900'>{friend.name}</h3>
        <p className='mt-1 text-xs text-gray-600'>{friend.location}</p>
        <div className='mt-2 flex items-center text-xs text-gray-500'>
          <div className='mr-2 h-2 w-2 rounded-full bg-blue-500'></div>
          Current Location
        </div>
      </div>
    </div>
  );
};

export default FriendMapView;
