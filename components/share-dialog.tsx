import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Share2 } from 'lucide-react';
import { SocialShare } from './social-share';
import { useTranslations } from 'next-intl';

interface ShareDialogProps {
  elementRef: React.RefObject<HTMLElement | null>;
  filename: string;
}

export function ShareDialog({ elementRef, filename }: ShareDialogProps) {
  const t = useTranslations();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          <Share2 className='h-4 w-4' />
          {t('sharing.share')}
        </Button>
      </DialogTrigger>
      <DialogContent className='w-100'>
        <h2 className='mb-4 text-xl font-bold'>
          {t('sharing.shareCalendar')}
        </h2>
        <SocialShare elementRef={elementRef} filename={filename} />
      </DialogContent>
    </Dialog>
  );
}