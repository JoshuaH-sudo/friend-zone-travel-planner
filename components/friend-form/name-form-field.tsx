import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

function NameFormField() {
  const form = useFormContext();
  const t = useTranslations('friend.form.name');

  return (
    <div id='name-form-field' className='space-y-2'>
      <FormField
        control={form.control}
        name='name'
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('label')}</FormLabel>

            <FormControl>
              <Input placeholder={t('placeholder')} {...field} />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default NameFormField;
