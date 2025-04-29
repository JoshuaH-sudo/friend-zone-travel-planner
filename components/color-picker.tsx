'use client';
import type React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';

interface ColorPickerProps {
  availableColors?: string[];
  color: string;
  onChange: (color: string) => void;
}

export const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#ec4899', // pink
];

export function ColorPicker({
  availableColors,
  color,
  onChange,
}: ColorPickerProps) {
  const t = useTranslations('colourPicker');

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Tabs defaultValue='preset' className='w-full'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='preset'>{t('presetColors')}</TabsTrigger>
        <TabsTrigger value='custom'>{t('customColor')}</TabsTrigger>
      </TabsList>

      <TabsContent value='preset' className='pt-2'>
        <div className='flex flex-wrap gap-2'>
          {PRESET_COLORS.map((c) => {
            const isColorTaken =
              availableColors && !availableColors.includes(c);
            return (
              <button
                key={c}
                type='button'
                className={cn(
                  'h-8 w-8 rounded-full border-2 transition-all',
                  color === c
                    ? `${isColorTaken ?? 'scale-110'} border-black dark:border-white`
                    : 'border-transparent hover:scale-110'
                )}
                style={{
                  backgroundColor: c,
                  opacity: isColorTaken ? 0.5 : 1,
                }}
                disabled={isColorTaken}
                onClick={() => onChange(c)}
                aria-label={`Select color ${c}`}
              />
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value='custom' className='space-y-2 pt-2'>
        <div className='flex items-center gap-3'>
          <div
            className='h-8 w-8 rounded-full border'
            style={{ backgroundColor: color }}
          />
          <Input
            type='color'
            value={color}
            onChange={handleCustomColorChange}
            className='h-8 w-16 overflow-hidden p-0'
          />
          <Input
            type='text'
            value={color}
            onChange={handleCustomColorChange}
            placeholder='#RRGGBB'
            className='flex-1'
            maxLength={7}
            pattern='^#[0-9A-Fa-f]{6}$'
          />
        </div>
        <p className='text-xs text-muted-foreground'>{t('helperText')}</p>
      </TabsContent>
    </Tabs>
  );
}
