'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function handleLogout() {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      return { error: 'Failed to sign out. Please try again.' };
    }

    redirect('/signin');
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
