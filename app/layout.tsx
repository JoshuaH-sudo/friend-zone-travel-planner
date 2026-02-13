import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { DatabaseProvider } from "@/lib/DatabaseProvider";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DatabaseProvider>
          <Header />
          {children}
          <div className="mt-12 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Friend Zone Travel Planner. All
            rights reserved.
          </div>
        </DatabaseProvider>
      </body>
    </html>
  );
}
