'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'

export default async function getFriends() {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: friends, error } = await supabase
    .from('friends')
    .select(`
      *,
      destinations (
        id,
        location
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching friends:', error)
    throw new Error('Failed to fetch friends')
  }

  return friends || []
}

