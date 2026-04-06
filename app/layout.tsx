import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Friend Zone Travel Planner",
  description:
    "Plan your trips with friends and keep all your travel details in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}bg-zinc-50 relative flex h-screen flex-col font-sans antialiased dark:bg-black`}
      >
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
                <main className="w-full max-w-4xl items-center gap-4 px-4 mx-auto py-10 sm:items-start">
                  {children}
                </main>
              </div>
              <footer className="w-full py-2 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Friend Zone Travel Planner. All
                rights reserved.
              </footer>
            </SettingsProvider>
          </DatabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
