import type React from 'react';
import '@/app/globals.css';
import { ThemeProvider } from 'next-themes';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { Header } from '@/app/[locale]/components/header/header';
import { Geist, Roboto } from 'next/font/google'

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
})

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
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider>
            <div
              style={{
                background:
                  'linear-gradient(180deg, #0084FF 0%, #C5F1FF 50%, #D5C5FF 100%), white',
              }}
            >
              <Header />
              {children}
            </div>
            <SpeedInsights />
            <Analytics />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
