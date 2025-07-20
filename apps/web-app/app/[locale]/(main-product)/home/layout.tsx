import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '../../(marketing)/landing/components/header/language-switcher';
import { ThemeToggle } from '../../(marketing)/landing/components/header/theme-toggle';
import { HomeLayoutContent } from './home-layout-content';

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication on the server side
  const session = await auth();

  if (!session) {
    // Redirect to signin if not authenticated
    redirect('/signin');
  }

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
            <div id='app-actions'>
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <HomeLayoutContent>{children}</HomeLayoutContent>
      </SidebarInset>
    </SidebarProvider>
  );
}
