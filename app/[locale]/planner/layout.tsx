'use client';

import type React from 'react';
import '@/app/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <main className='container mx-auto max-w-6xl p-4'>{children}</main>
    </QueryClientProvider>
  );
}
