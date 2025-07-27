'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export default async function deleteFriend(friendId: string) {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('id', friendId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting friend:', error)
    throw new Error('Failed to delete friend')
  }

  revalidatePath('/home/friends')
  return { success: true }
}

