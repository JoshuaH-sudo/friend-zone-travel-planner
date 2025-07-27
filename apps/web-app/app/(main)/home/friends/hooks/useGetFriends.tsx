'use client'

import { useQuery } from '@tanstack/react-query'
import getFriends from '../actions/getFriends'

export interface Friend {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  street: string | null
  city: string | null
  state_province: string | null
  country: string | null
  postal_code: string | null
  user_id: string
  destination_id: string | null
  created_at: string | null
  updated_at: string | null
  destinations?: {
    id: string
    location: string
  } | null
}

const useGetFriends = () => {
  return useQuery({
    queryKey: ['friends'],
    queryFn: getFriends,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export default useGetFriends

