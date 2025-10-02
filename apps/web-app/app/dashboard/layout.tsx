import { requireAuth } from '@/lib/auth';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { ThemeToggle } from '../../components/theme-toggle';
import { LanguageSwitcher } from '../../components/language-switcher';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication on the server side - redirects if not authenticated
  await requireAuth();

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

              <Link href='/dashboard' className='flex items-center space-x-2'>
                <h1 className='text-foreground hover:text-primary text-xl font-semibold transition-colors'>
                  Friend Zone Travel Planner
                </h1>
              </Link>
            </div>
            <div id='app-actions'>
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
