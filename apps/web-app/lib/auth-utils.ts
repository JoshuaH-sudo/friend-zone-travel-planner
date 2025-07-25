import { createClient } from './supabase/server'
import { getUser } from './auth'

/**
 * Get the current user session
 */
export async function getCurrentUser() {
  return await getUser()
}

/**
 * Get the current user's ID from session
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getUser()
  return user?.id || null
}

/**
 * Check if a user exists by email (using Supabase Auth)
 * Note: This is primarily for admin use cases as regular users
 * cannot query other users' data due to RLS policies
 */
export async function userExists(email: string): Promise<boolean> {
  const supabase = await createClient()
  
  // This would require service role key for admin operations
  // For regular user operations, Supabase Auth handles user existence checks
  // during sign up and will return appropriate errors
  
  try {
    const { data, error } = await supabase.auth.admin.getUserByEmail(email)
    return !!data.user && !error
  } catch (error) {
    console.error('Error checking user existence:', error)
    return false
  }
}

