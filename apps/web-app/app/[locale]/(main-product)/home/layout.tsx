"use client";
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ChevronLeftIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
              visibility: pathname?.endsWith('/home') ? 'hidden' : 'visible',
              display: pathname?.endsWith('/home') ? 'none' : 'flex',
            }}
          >
            <ChevronLeftIcon className='text-muted-foreground h-6 w-6' /> Back
          </Link>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
