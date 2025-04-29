'use client';

import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/header/language-switcher';
import { ThemeToggle } from '@/components/header/theme-toggle';
import travelIcon from '@/public/travel.png';
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  const t = useTranslations('app');

  return (
    <header className='border-b'>
      <div className='container mx-auto flex items-center justify-between px-4 py-4'>
        <Link
          href='/'
          className='flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground'
        >
          <div className='flex items-center gap-2'>
            <Image
              src={travelIcon.src}
              width={24}
              alt='Travel Icon'
              className='h-6 w-6 text-primary'
            />
            <span className='text-xl font-bold'>{t('title')}</span>
          </div>
        </Link>
        
        <div className='flex gap-4'>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
