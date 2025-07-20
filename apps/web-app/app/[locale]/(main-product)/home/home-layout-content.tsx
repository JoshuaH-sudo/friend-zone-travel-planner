'use client';
import { ChevronLeftIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';

export function HomeLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
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
  );
}
