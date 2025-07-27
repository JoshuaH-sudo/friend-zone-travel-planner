'use client'

import { useEffect, useRef } from 'react'
import { Friend } from '../hooks/useGetFriends'

interface FriendMapViewProps {
  friend: Friend
}

const FriendMapView = ({ friend }: FriendMapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)

  useEffect(() => {
    if (!mapRef.current || !window.google) return

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: friend.latitude, lng: friend.longitude },
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    })

    mapInstanceRef.current = map

    // Create marker
    const marker = new window.google.maps.Marker({
      position: { lat: friend.latitude, lng: friend.longitude },
      map: map,
      title: friend.name,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" stroke-width="3"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 16),
      },
    })

    markerRef.current = marker

    // Create info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-semibold text-sm">${friend.name}</h3>
          <p class="text-xs text-gray-600 mt-1">${getFormattedAddress(friend)}</p>
        </div>
      `,
    })

    marker.addListener('click', () => {
      infoWindow.open(map, marker)
    })

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null)
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null
      }
    }
  }, [friend])

  const getFormattedAddress = (friend: Friend) => {
    const addressParts = [
      friend.street,
      friend.city,
      friend.state_province,
      friend.country,
      friend.postal_code
    ].filter(Boolean)
    
    return addressParts.length > 0 ? addressParts.join(', ') : friend.location
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Friend info overlay */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
        <h3 className="font-semibold text-sm text-gray-900">{friend.name}</h3>
        <p className="text-xs text-gray-600 mt-1">{getFormattedAddress(friend)}</p>
        <div className="flex items-center mt-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          Current Location
        </div>
      </div>
    </div>
  )
}

export default FriendMapView

