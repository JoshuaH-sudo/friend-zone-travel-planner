import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import "./globals.css";
import Header from "./components/Header";
import { DatabaseProvider } from "@/lib/DatabaseProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsProvider } from "@/lib/SettingsProvider";

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations("layout");

  return (
    <html lang={locale} className={roboto.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}bg-zinc-50 relative flex h-screen flex-col font-sans antialiased dark:bg-black`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <DatabaseProvider>
              <SettingsProvider>
                <Header />
                <div className="flex grow">
                  <main className="mx-auto w-full max-w-6xl items-center gap-4 px-4 py-10 sm:items-start">
                    {children}
                  </main>
                </div>
                <footer className="w-full py-2 text-center text-sm text-gray-500">
                  {t("footer", { year: new Date().getFullYear() })}
                </footer>
              </SettingsProvider>
            </DatabaseProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
