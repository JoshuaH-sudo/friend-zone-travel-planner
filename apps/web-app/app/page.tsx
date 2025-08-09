'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  
  if (user.data.user) {
    // If the user is already logged in, redirect to the home page
    return redirect('/dashboard');
  }
  return redirect('/signin');
}
