'use client'

import { useQuery } from '@tanstack/react-query'
import getFriends from '../actions/getFriends'

export type Friend = Awaited<ReturnType<typeof getFriends>>[number]

const useGetFriends = () => {
  return useQuery({
    queryKey: ['friends'],
    queryFn: getFriends,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export default useGetFriends

