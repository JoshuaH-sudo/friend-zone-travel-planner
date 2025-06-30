import '@/app/globals.css';
import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import { routing } from '../i18n/routing';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { Roboto } from 'next/font/google';
import { PostHogProvider, TanStackQueryProvider } from './providers';

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

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale} suppressHydrationWarning className={roboto.className}>
      <body>
        <PostHogProvider>
          <TanStackQueryProvider>
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
          </TanStackQueryProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
