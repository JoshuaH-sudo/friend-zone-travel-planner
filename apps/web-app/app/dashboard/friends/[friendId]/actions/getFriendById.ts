'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'

export default async function getFriendById(friendId: string) {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: friend, error } = await supabase
    .from('friends')
    .select(`
      *,
      destinations (
        id,
        location
      )
    `)
    .eq('user_id', user.id)
    .eq('id', friendId)
    .order('created_at', { ascending: false })
    .single()

  if (error) {
    console.error('Error fetching friend:', error)
    throw new Error('Failed to fetch friend')
  }

  return friend;
}

