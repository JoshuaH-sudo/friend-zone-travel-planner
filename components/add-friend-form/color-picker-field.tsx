import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Friend } from '@/lib/types';
import { ColorPicker, PRESET_COLORS } from '../color-picker';

interface ColorPickerFieldProps {
  friends: Friend[];
}

function ColorPickerField({ friends }: ColorPickerFieldProps) {
  const form = useFormContext();
  const t = useTranslations('friend');

  const takenColors = friends.map((f) => f.color);
  const availableColors = PRESET_COLORS.filter(
    (color) => !takenColors.includes(color)
  );

  return (
    <div id='color-form-field' className='space-y-2'>
      <FormField
        control={form.control}
        name='color'
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('color')}</FormLabel>
            <FormControl>
              <ColorPicker
                availableColors={availableColors}
                color={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
export default ColorPickerField;
