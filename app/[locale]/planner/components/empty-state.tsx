'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface EmptyStateProps {
  onShowAddFriend: () => void;
}

export function EmptyState({ onShowAddFriend }: EmptyStateProps) {
  const t = useTranslations('app');
  return (
    <div className='flex flex-col items-center justify-center gap-4 rounded-lg border bg-muted/50 p-12'>
      <h2 className='text-xl font-medium'>{t('noFriendsTitle')}</h2>
      <p className='max-w-md text-center text-muted-foreground'>
        {t('noFriendsDescription')}
      </p>
      <div className='mt-2 flex gap-2'>
        <Button onClick={onShowAddFriend} className='gap-2'>
          <PlusCircle className='h-4 w-4' />
          {t('actions.addFriend')}
        </Button>
        <Button
          variant='outline'
          onClick={() =>
            document
              .querySelector<HTMLButtonElement>('[data-import-trigger]')
              ?.click()
          }
          className='gap-2'
        >
          <Download className='h-4 w-4' />
          {t('actions.import')}
        </Button>
      </div>
    </div>
  );
}
