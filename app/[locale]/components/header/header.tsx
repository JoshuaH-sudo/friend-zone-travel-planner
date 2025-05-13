'use client';

import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/app/[locale]/components/header/language-switcher';
import { ThemeToggle } from '@/app/[locale]/components/header/theme-toggle';
import travelIcon from '@/public/travel.png';
import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  const t = useTranslations('app');

  return (
    <header className='fixed top-2 left-0 right-0 z-50 flex items-center justify-center'>
      <div className='inline-flex h-16 w-[766px] items-center justify-between overflow-hidden rounded-3xl bg-green-300/80 px-6 py-3 outline outline-2 outline-offset-[-2px] outline-black backdrop-blur-[2px]'>
        <div className='flex items-center justify-start gap-2'>
          <Link
            href='/'
            className='flex items-center gap-2 text-foreground transition-colors hover:text-muted-foreground'
          >
            <Image
              src={travelIcon.src}
              width={24}
              height={24}
              alt='Travel Icon'
              className='h-6 w-6 text-primary'
            />
            <span className='text-xl font-bold text-black'>{t('title')}</span>
          </Link>
        </div>
        <div className='flex items-center justify-start gap-4'>
          <div className='flex text-black'>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
