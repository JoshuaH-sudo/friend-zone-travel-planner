'use client'

import { useQuery } from '@tanstack/react-query'
import getFriendById from '../[friendId]/actions/getFriendById'

const useGetFriendById = (friendId: string) => {
  return useQuery({
    queryKey: ['friends', friendId],
    queryFn: () => getFriendById(friendId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export default useGetFriendById

