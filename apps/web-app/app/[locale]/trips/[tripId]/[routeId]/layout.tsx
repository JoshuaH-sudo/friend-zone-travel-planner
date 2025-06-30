'use client';

import type React from 'react';
import '@/app/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <main className='max-w-8xl container mx-auto p-4 sm:h-screen'>
      {children}
    </main>
  );
}
