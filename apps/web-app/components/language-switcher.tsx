'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

// Define available languages
const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const changeLanguage = async (locale: string) => {
    await i18n.changeLanguage(locale);
  };

  if (!mounted) {
    return (
      <Button variant='ghost' size='icon' className='h-9 w-9'>
        <Globe className='h-4 w-4' />
        <span className='sr-only'>switch</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-9 w-9'>
          <Globe className='h-4 w-4' />
          <span className='sr-only'>switch</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={i18n.language === language.code ? 'font-bold bg-accent/50' : ''}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
