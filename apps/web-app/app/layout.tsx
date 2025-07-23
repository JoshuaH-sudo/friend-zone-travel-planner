import '@/app/globals.css';
import { ThemeProvider } from 'next-themes';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { Roboto } from 'next/font/google';
import { PostHogProvider, TanStackQueryProvider } from './providers';
import { I18nProvider } from './i18n-provider';

export const metadata = {
  title: 'Friend Zoned Travel Planner',
  description: 'Plan trips with friends across different timezones',
};

const roboto = Roboto({
  weight: '600',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={roboto.className}>
      <body>
        <PostHogProvider>
          <TanStackQueryProvider>
            <I18nProvider>
              <ThemeProvider
                attribute='class'
                defaultTheme='system'
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <SpeedInsights />
                <Analytics />
              </ThemeProvider>
            </I18nProvider>
          </TanStackQueryProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
