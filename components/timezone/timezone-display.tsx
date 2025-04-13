import { Globe } from 'lucide-react';
import { Label } from '../ui/label';
import { useTranslations } from 'next-intl';
import { secondsToHours } from 'date-fns';

interface TimezoneDisplayProps {
  timezoneText: string;
}

export const displayTimezoneOffset = (timezone: string, timezoneOffset: number) => {
      const timezoneOffsetHours = secondsToHours(timezoneOffset);
      return `${timezone} (UTC${timezoneOffsetHours >= 0 ? '+' : ''}${timezoneOffsetHours})`;
};

function TimezoneDisplay({ timezoneText }: TimezoneDisplayProps) {
  const t = useTranslations('friend');

  return (
    <div id='timezone-form-field' className='space-y-2'>
      <div className='flex items-center gap-2'>
        <Globe className='h-4 w-4 text-muted-foreground' />
        <Label htmlFor='timezone'>{t('timezone')}</Label>
      </div>
      <p className='text-xs text-muted-foreground'>{timezoneText}</p>
    </div>
  );
}
export default TimezoneDisplay;
