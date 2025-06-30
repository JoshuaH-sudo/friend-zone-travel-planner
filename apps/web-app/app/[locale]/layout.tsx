"use client";
import type React from 'react';
import '@/app/globals.css';
import { ThemeProvider } from 'next-themes';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import {
  QueryClient,
  QueryClientProvider,
  useIsFetching,
} from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { Roboto } from 'next/font/google';
import { PostHogProvider } from '../providers';

export const metadata = {
  title: 'Friend Zoned Travel Planner',
  description: 'Plan trips with friends across different timezones',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const roboto = Roboto({
  weight: '600',
  subsets: ['latin'],
});

const queryClient = new QueryClient();

function LoadingArea() {
  const isFetching = useIsFetching();
  if (!isFetching) {
    return <div className='h-1' />;
  }
  return <Progress indeterminate />;
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
    <html lang={locale} suppressHydrationWarning className={roboto.className}>
      <body>
        <PostHogProvider>
          <QueryClientProvider client={queryClient}>
            <LoadingArea />
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange
            >
              <NextIntlClientProvider>
                {children}
                <SpeedInsights />
                <Analytics />
              </NextIntlClientProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
