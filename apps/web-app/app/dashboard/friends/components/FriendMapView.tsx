'use client';

import { Friend } from '../hooks/useGetFriends';
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
} from '@vis.gl/react-google-maps';

interface FriendMapViewProps {
  friend: Friend[];
}

const FriendMapView = ({ friend }: FriendMapViewProps) => {
  if (friend.length === 0) {
    return null;
  }

  // Calculate center and bounds for multiple friends
  let center: google.maps.LatLngLiteral;
  let zoom = 13;

  if (friend.length === 1) {
    center = { lat: friend[0].latitude, lng: friend[0].longitude };
  } else {
    // Calculate center from all friends
    const totalLat = friend.reduce((sum, f) => sum + f.latitude, 0);
    const totalLng = friend.reduce((sum, f) => sum + f.longitude, 0);
    center = {
      lat: totalLat / friend.length,
      lng: totalLng / friend.length,
    };
    zoom = 2; // Start with a wider zoom for multiple friends
  }

  return (
    <div key={friend.map(f => f.id).join('-')} className='relative h-full w-full'>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <Map
          mapId='e8e51ecff87a146cf2857bda'
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '0.65rem',
            overflow: 'hidden',
          }}
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          <FriendMarkers friends={friend} />
        </Map>
      </APIProvider>

      {/* Friend info overlay */}
      {friend.length > 1 ? (
        // Multiple friends overlay
        <div className='absolute top-4 left-4 max-w-xs rounded-lg bg-white p-3 shadow-lg'>
          <h3 className='text-sm font-semibold text-gray-900'>
            {friend.length} Friend{friend.length !== 1 ? 's' : ''}
          </h3>
          <p className='mt-1 text-xs text-gray-600'>
            Click markers for details
          </p>
          <div className='mt-2 flex items-center text-xs text-gray-500'>
            <div className='mr-2 h-2 w-2 rounded-full bg-blue-500'></div>
            Friend Locations
          </div>
        </div>
      ) : friend.length === 1 ? (
        // Single friend overlay
        <div className='absolute top-4 left-4 max-w-xs rounded-lg bg-white p-3 shadow-lg'>
          <h3 className='text-sm font-semibold text-gray-900'>{friend[0].name}</h3>
          <p className='mt-1 text-xs text-gray-600'>{friend[0].location}</p>
          <div className='mt-2 flex items-center text-xs text-gray-500'>
            <div className='mr-2 h-2 w-2 rounded-full bg-blue-500'></div>
            Current Location
          </div>
        </div>
      ) : null}
    </div>
  );
};

const FriendMarkers = ({ friends }: { friends: Friend[] }) => {
  return (
    <>
      {friends.map((friend) => (
        <AdvancedMarker 
          key={friend.id} 
          position={{ lat: friend.latitude, lng: friend.longitude }}
          title={friend.name}
        >
          <Pin
            background={'#3B82F6'}
            glyphColor={'#FFFFFF'}
            borderColor={'#FFFFFF'}
          />
        </AdvancedMarker>
      ))}
    </>
  );
};

export default FriendMapView;
