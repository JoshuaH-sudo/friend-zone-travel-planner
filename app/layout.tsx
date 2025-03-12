import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "next-themes";
import {NextIntlClientProvider} from 'next-intl';
import {getLocale} from 'next-intl/server';

export const metadata = {
  title: "Friend Calendar Planner",
  description: "Plan events with friends across different timezones",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale(); 
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

