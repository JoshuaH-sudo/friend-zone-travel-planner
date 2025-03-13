'use client';

import type React from 'react';

import { RefObject, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Facebook,
  Instagram,
  Share2,
  MessageCircle,
  Copy,
  Download,
  Check,
  X,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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

interface SocialShareProps {
  elementRef: RefObject<HTMLElement | null>;
  filename: string;
}

export function SocialShare({ elementRef, filename }: SocialShareProps) {
  const t = useTranslations();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Capture the calendar as an image
  const captureCalendar = async () => {
    if (!elementRef?.current) return;

    setIsCapturing(true);
    setError(null);

    try {
      const dataUrl = await captureElementAsImage(elementRef.current);
      setImageUrl(dataUrl);
    } catch (err) {
      setError(t('sharing.captureError'));
      console.error('Failed to capture calendar:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  // Copy image to clipboard
  const handleCopyImage = async () => {
    if (!imageUrl) return;

    try {
      const success = await copyImageToClipboard(imageUrl);
      if (success) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        // If the copy failed but didn't throw an error, show a message
        setError(t('sharing.copyError'));
        // Suggest download as alternative
        handleDownloadImage();
      }
    } catch (err) {
      setError(t('sharing.copyError'));
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
      setError(t('sharing.downloadError'));
      console.error('Failed to download image:', err);
    }
  };

  // Share to WhatsApp
  const shareToWhatsApp = () => {
    if (!imageUrl) return;

    // WhatsApp doesn't support direct image sharing via URL
    // So we'll download the image first and suggest manual sharing
    handleDownloadImage();
    window.open('https://web.whatsapp.com/', '_blank');
  };

  // Share to Facebook Messenger
  const shareToMessenger = () => {
    if (!imageUrl) return;

    // Facebook Messenger doesn't support direct image sharing via URL
    // So we'll download the image first and suggest manual sharing
    handleDownloadImage();
    window.open('https://www.messenger.com/', '_blank');
  };

  // Share to Instagram
  const shareToInstagram = () => {
    if (!imageUrl) return;

    // Instagram doesn't support direct image sharing via URL
    // So we'll download the image first and suggest manual sharing
    handleDownloadImage();
    window.open('https://www.instagram.com/', '_blank');
  };

  // Use Web Share API if available
  const useNativeShare = async () => {
    if (!imageUrl) return;

    if (navigator.share) {
      try {
        // Convert data URL to blob
        const byteString = atob(imageUrl.split(',')[1]);
        const mimeString = imageUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeString });
        const file = new File(
          [blob],
          `${filename.replace(/\s+/g, '_')}_calendar.png`,
          { type: 'image/png' }
        );

        await navigator.share({
          title: t('sharing.calendarTitle', {
            name: filename || t('app.title'),
          }),
          text: t('sharing.calendarDescription'),
          files: [file],
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError(t('sharing.shareError'));
          console.error('Error sharing:', err);
          // Fallback to download
          handleDownloadImage();
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleDownloadImage();
    }
  };

  useEffect(() => {
    captureCalendar();
  }, []);

  return (
    <div className='space-y-4'>
      <div className='space-y-4'>
        <div className='overflow-hidden rounded-md border'>
          {isCapturing && (
            <div className='flex items-center justify-center h-64'>
              loading...
            </div>
          )}

          <img
            src={imageUrl || '/placeholder.svg'}
            alt={t('sharing.calendarPreview')}
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
                      {t('sharing.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className='h-4 w-4' />
                      {t('sharing.copyImage')}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('sharing.copyTooltip')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant='outline'
            onClick={handleDownloadImage}
            className='gap-2'
          >
            <Download className='h-4 w-4' />
            {t('sharing.downloadImage')}
          </Button>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button onClick={useNativeShare} className='gap-2'>
            <Share2 className='h-4 w-4' />
            {t('sharing.share')}
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' className='gap-2'>
                <MessageCircle className='h-4 w-4' />
                {t('sharing.shareToApps')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-2'>
              <div className='flex gap-2'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size='icon'
                        variant='outline'
                        onClick={shareToWhatsApp}
                      >
                        <span className='text-lg'>📱</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('sharing.whatsapp')}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size='icon'
                        variant='outline'
                        onClick={shareToMessenger}
                      >
                        <Facebook className='h-4 w-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('sharing.messenger')}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size='icon'
                        variant='outline'
                        onClick={shareToInstagram}
                      >
                        <Instagram className='h-4 w-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('sharing.instagram')}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Button
          variant='ghost'
          onClick={() => setImageUrl(null)}
          className='w-full gap-2'
        >
          <X className='h-4 w-4' />
          {t('sharing.cancel')}
        </Button>
      </div>
    </div>
  );
}
