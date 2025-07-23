'use client';

import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '../../../../../components/theme-toggle';
import travelIcon from '@/public/travel.png';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const { t } = useTranslation('common');
  const pathname = usePathname();

  console.log('Header pathname:', pathname);

  return (
    <header className='fixed top-2 right-0 left-0 z-50 flex items-center justify-center'>
      <div className='inline-flex h-16 w-[766px] items-center justify-between overflow-hidden rounded-3xl bg-green-300/80 px-6 py-3 outline-2 -outline-offset-2 outline-black backdrop-blur-[2px] outline-solid'>
        <div className='flex items-center justify-start gap-2'>
          <Link
            href='/'
            className='text-foreground hover:text-muted-foreground flex items-center gap-2 transition-colors'
          >
            <Image
              src={travelIcon.src}
              width={24}
              height={24}
              alt='Travel Icon'
              className='text-primary h-6 w-6'
            />
            <span className='text-xl font-bold text-black'>{t('app.title')}</span>
          </Link>
        </div>
        <div className='flex items-center justify-start gap-4'>
          <div className='flex text-black'>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
