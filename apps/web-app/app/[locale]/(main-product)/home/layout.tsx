import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';
import { ChevronLeftIcon } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get('x-current-path');

  return (
    <div className='bg-background min-h-screen'>
      {/* Header */}
      <header className='border-border bg-background border-b'>
        <div className='container mx-auto flex items-center justify-between px-4 py-4'>
          {/* App Name */}
          <div className='flex items-center space-x-4'>
            <Link
              href='..'
              className='flex items-center space-x-2'
              style={{
                visibility: pathname === '/home' ? 'hidden' : 'visible',
              }}
            >
              <ChevronLeftIcon className='text-muted-foreground h-6 w-6' />
            </Link>

            <Link href='/home' className='flex items-center space-x-2'>
              <h1 className='text-foreground hover:text-primary text-xl font-semibold transition-colors'>
                Friend Zone Travel Planner
              </h1>
            </Link>
          </div>

          {/* Logout Button */}
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <Button type='submit' variant='outline'>
              Logout
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className='container mx-auto px-4 py-6'>{children}</main>
    </div>
  );
}
