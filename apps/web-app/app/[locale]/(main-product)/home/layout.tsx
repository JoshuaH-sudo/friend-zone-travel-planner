import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className='border-border bg-background border-b'>
          <div className='flex items-center justify-between px-4 py-4'>
            {/* Left side with sidebar trigger and navigation */}
            <div className='flex items-center space-x-4'>
              <SidebarTrigger />

              <Link href='/home' className='flex items-center space-x-2'>
                <h1 className='text-foreground hover:text-primary text-xl font-semibold transition-colors'>
                  Friend Zone Travel Planner
                </h1>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='flex-1 px-4 py-6'>
          <Link
            href='..'
            className='flex items-center space-x-2'
            style={{
              visibility: pathname === '/home' ? 'hidden' : 'visible',
            }}
          >
            <ChevronLeftIcon className='text-muted-foreground h-6 w-6' />
          </Link>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
