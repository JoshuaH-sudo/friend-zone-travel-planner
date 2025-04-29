import { Globe } from 'lucide-react';
import { Label } from '../ui/label';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import useFetchTimezoneInformation from '../hooks/useFetchTimeZoneInformation';
import { useEffect } from 'react';
import { addFriendFormContext } from './add-friend-form';
import { displayTimezoneOffset } from '../timezone/timezone-display';

function TimezoneFormField() {
  const form = useFormContext<addFriendFormContext>();
  const t = useTranslations('friend.form.timezone');

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
  }, [timezoneInformationError, form]);

  useEffect(() => {
    if (timezoneInformation) {
      console.log('Timezone information:', timezoneInformation);
      form.setValue('timezone', timezoneInformation?.timeZoneName, {
        shouldValidate: true,
        shouldDirty: true,
      });
      form.setValue(
        'timezoneOffset',
        timezoneInformation?.rawOffset + timezoneInformation?.dstOffset,
        {
          shouldValidate: true,
          shouldDirty: true,
        }
      );
      form.setValue('timeZoneId', timezoneInformation?.timeZoneId, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [timezoneInformation, form]);

  let timezoneText = t('placeholder');
  if (timezoneInformation) {
    timezoneText = displayTimezoneOffset(
      timezoneInformation.timeZoneName,
      timezoneInformation.rawOffset + timezoneInformation.dstOffset
    );
  }

  return (
    <div id='timezone-form-field' className='space-y-2'>
      <div className='flex items-center gap-2'>
        <Globe className='h-4 w-4 text-muted-foreground' />
        <Label htmlFor='timezone'>{t('label')}</Label>
      </div>
      <p className='text-xs text-muted-foreground'>{timezoneText}</p>
    </div>
  );
}
export default TimezoneFormField;
