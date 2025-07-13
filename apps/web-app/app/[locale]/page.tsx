import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const session = await auth();
  
  if (session) {
    // Redirect authenticated users to trips
    redirect('/trips');
  } else {
    // Redirect unauthenticated users to login
    redirect('/login');
  }
}
