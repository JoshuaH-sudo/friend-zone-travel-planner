import { createClient } from './supabase/server';
import { createClient as createClientClient } from './supabase/client';
import { redirect } from 'next/navigation';

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error('Error getting user:', error);
    throw error;
  }

  return user;
}

export async function requireAuth() {
  const user = await getUser();

  if (!user) {
    redirect('/signin');
  }

  return user;
}

export async function signInWithGoogle() {
  const supabase = createClientClient();
  
  // Determine the redirect URL based on environment
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      // Client-side: use window.location.origin
      return `${window.location.origin}/auth/callback`;
    } else {
      // Server-side fallback (though this function should only be called client-side)
      const isLocalEnv = process.env.NODE_ENV === 'development';
      return isLocalEnv 
        ? 'http://localhost:3000/auth/callback'
        : 'https://www.friend-zone.app/auth/callback';
    }
  };

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getRedirectUrl(),
    },
  });

  if (error) {
    throw new Error('Failed to sign in with Google. Please try again.');
  }

  return data;
}

