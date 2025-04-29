'use client';
import type React from 'react';
import { RefObject, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  captureElementAsImage,
  copyImageToClipboard,
  downloadImage,
} from '@/lib/image-capture';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface SocialShareProps {
  elementRef: RefObject<HTMLElement | null>;
  filename: string;
}

export function SocialShare({ elementRef, filename }: SocialShareProps) {
  const t = useTranslations('sharing');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Capture the calendar as an image
  const captureCalendar = useCallback(async () => {
    if (!elementRef?.current) return;

    setIsCapturing(true);
    setError(null);

    try {
      const { dataUrl, dataBlob } = await captureElementAsImage(
        elementRef.current
      );
      setImageUrl(dataUrl);
      setImageBlob(dataBlob);
    } catch (err) {
      setError(t('captureError'));
      console.error('Failed to capture calendar:', err);
    } finally {
      setIsCapturing(false);
    }
  }, [t, elementRef]);

  // Copy image to clipboard
  const handleCopyImage = async () => {
    if (!imageBlob) return;

    try {
      const success = await copyImageToClipboard(imageBlob);
      if (success) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        // If the copy failed but didn't throw an error, show a message
        setError(t('copyError'));
        // Suggest download as alternative
        handleDownloadImage();
      }
    } catch (err) {
      setError(t('copyError'));
      console.error('Failed to copy image:', err);
      // Suggest download as alternative
      handleDownloadImage();
    }
  };

  // Download image
  const handleDownloadImage = () => {
    if (!imageUrl) return;
    try {
      downloadImage(imageUrl, `${filename.replace(/\s+/g, '_')}_calendar.png`);
    } catch (err) {
      setError(t('downloadError'));
      console.error('Failed to download image:', err);
    }
  };

  useEffect(() => {
    captureCalendar();
  }, [captureCalendar]);

  return (
    <div className='space-y-4'>
      <div className='space-y-4'>
        <div className='overflow-hidden rounded-md border'>
          {isCapturing && (
            <div className='flex h-64 items-center justify-center'>
              {t('capturing')}
            </div>
          )}

          <Image
            width={500}
            src={imageUrl || '/placeholder.svg'}
            alt={t('calendarPreview')}
            className='h-auto w-full'
          />
        </div>

        {error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className='grid grid-cols-2 gap-2'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  onClick={handleCopyImage}
                  className='gap-2'
                >
                  {isCopied ? (
                    <>
                      <Check className='h-4 w-4' />
                      {t('copied')}
                    </>
                  ) : (
                    <>
                      <Copy className='h-4 w-4' />
                      {t('copyImage')}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('copyTooltip')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant='outline'
            onClick={handleDownloadImage}
            className='gap-2'
          >
            <Download className='h-4 w-4' />
            {t('downloadImage')}
          </Button>
        </div>
      </div>
    </div>
  );
}
