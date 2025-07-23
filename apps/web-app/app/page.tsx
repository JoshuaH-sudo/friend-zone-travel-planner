import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const session = await auth();

  if (!session) {
    console.debug('No session found, redirecting to sign-in page');
    return redirect('/signin');
  }

  console.debug('Session found, redirecting to home page');
  return redirect('/home');
}
