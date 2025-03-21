import { Friend } from '@/lib/types';
import { Globe } from 'lucide-react';
import { Label } from '../ui/label';
import { secondsToHours } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import useFetchTimezoneInformation from '../hooks/useFetchTimeZoneInformation';
import { useEffect } from 'react';

interface TimezoneFormFieldProps {}

function TimezoneFormField({}: TimezoneFormFieldProps) {
  const form = useFormContext();
  const t = useTranslations('friend');

  const coordinates = form.watch('coordinates');
  const { data: timezoneInformation, error: timezoneInformationError } =
    useFetchTimezoneInformation(coordinates);

  useEffect(() => {
    if (timezoneInformationError) {
      form.setError('timezone', {
        type: 'manual',
        message: timezoneInformationError.message,
      });
    } else {
      form.clearErrors('timezone');
    }
  }, [timezoneInformationError]);

  let timezoneText = 'input location';
  if (timezoneInformation) {
    const timezoneOffsetSeconds =
      timezoneInformation.rawOffset + timezoneInformation.dstOffset;
    const timezoneOffsetHours = secondsToHours(timezoneOffsetSeconds);
    timezoneText = `${timezoneInformation.timeZoneName} (UTC${timezoneOffsetHours >= 0 ? '+' : ''}${timezoneOffsetHours})`;
  }

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
export default TimezoneFormField;
