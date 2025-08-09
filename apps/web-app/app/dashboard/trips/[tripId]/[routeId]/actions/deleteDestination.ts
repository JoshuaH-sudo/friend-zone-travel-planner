"use server"

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'

async function deleteDestination(destinationId: string) {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error: deleteError } = await supabase
    .from('destinations')
    .delete()
    .eq('id', destinationId)

  if (deleteError) {
    console.error('Error deleting destination:', deleteError)
    throw new Error('Failed to delete destination')
  }

  return { success: true }
}

export default deleteDestination
