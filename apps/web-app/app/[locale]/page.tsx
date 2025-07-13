import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const session = await auth();

  console.log('Session:', session);

  if (!session) {
    return redirect('/signin');
  }

  return redirect('/home');
}
