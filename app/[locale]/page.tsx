'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, Upload, Download, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/header/header';
import travelIcon from '@/public/travel.png';

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className='flex min-h-screen flex-col'>
      <main>
        <section className='px-4 py-20'>
          <div className='container mx-auto max-w-5xl text-center'>
            <h1 className='mb-6 text-4xl font-bold md:text-6xl'>
              {t('landing.title')}{' '}
              <span className='text-primary'>
                {t('landing.titleHighlight')}
              </span>
            </h1>
            <p className='mx-auto mb-10 max-w-3xl text-xl text-muted-foreground'>
              {t('landing.subtitle')}
            </p>
            <Link href='/planner'>
              <Button size='lg' className='gap-2'>
                <Calendar className='h-5 w-5' />
                {t('landing.startPlanning')}
              </Button>
            </Link>
          </div>
        </section>

        <section className='bg-muted/30 py-16'>
          <div className='container mx-auto px-4'>
            <h2 className='mb-12 text-center text-3xl font-bold'>
              {t('landing.features')}
            </h2>

            <div className='grid gap-8 md:grid-cols-3'>
              <div className='flex flex-col items-center rounded-lg bg-card p-6 text-center shadow-sm'>
                <div className='mb-4 rounded-full bg-primary/10 p-3'>
                  <Users className='h-8 w-8 text-primary' />
                </div>
                <h3 className='mb-2 text-xl font-medium'>
                  {t('landing.featureManagement.title')}
                </h3>
                <p className='text-muted-foreground'>
                  {t('landing.featureManagement.description')}
                </p>
              </div>

              <div className='flex flex-col items-center rounded-lg bg-card p-6 text-center shadow-sm'>
                <div className='mb-4 rounded-full bg-primary/10 p-3'>
                  <Globe className='h-8 w-8 text-primary' />
                </div>
                <h3 className='mb-2 text-xl font-medium'>
                  {t('landing.featureTimezone.title')}
                </h3>
                <p className='text-muted-foreground'>
                  {t('landing.featureTimezone.description')}
                </p>
              </div>

              <div className='flex flex-col items-center rounded-lg bg-card p-6 text-center shadow-sm'>
                <div className='mb-4 rounded-full bg-primary/10 p-3'>
                  <Clock className='h-8 w-8 text-primary' />
                </div>
                <h3 className='mb-2 text-xl font-medium'>
                  {t('landing.featureOverview.title')}
                </h3>
                <p className='text-muted-foreground'>
                  {t('landing.featureOverview.description')}
                </p>
              </div>
            </div>

            <div className='mt-8 grid gap-8 md:grid-cols-2'>
              <div className='flex flex-col items-center rounded-lg bg-card p-6 text-center shadow-sm'>
                <div className='mb-4 rounded-full bg-primary/10 p-3'>
                  <Download className='h-8 w-8 text-primary' />
                </div>
                <h3 className='mb-2 text-xl font-medium'>
                  {t('landing.featureImport.title')}
                </h3>
                <p className='text-muted-foreground'>
                  {t('landing.featureImport.description')}
                </p>
              </div>

              <div className='flex flex-col items-center rounded-lg bg-card p-6 text-center shadow-sm'>
                <div className='mb-4 rounded-full bg-primary/10 p-3'>
                  <Upload className='h-8 w-8 text-primary' />
                </div>
                <h3 className='mb-2 text-xl font-medium'>
                  {t('landing.featureExport.title')}
                </h3>
                <p className='text-muted-foreground'>
                  {t('landing.featureExport.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className='px-4 py-20 text-center'>
          <div className='container mx-auto max-w-3xl'>
            <h2 className='mb-6 text-3xl font-bold'>
              {t('landing.readyToStart')}
            </h2>
            <p className='mb-8 text-xl text-muted-foreground'>
              {t('landing.readyDescription')}
            </p>
            <Link href='/planner'>
              <Button size='lg'>{t('landing.goToPlanner')}</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className='border-t bg-muted/30 py-8'>
        <div className='container mx-auto px-4 text-center text-muted-foreground'>
          <a
            href='https://www.flaticon.com/free-icons/travel'
            title='travel icons'
          >
            Travel icons created by Freepik - Flaticon
          </a>
        </div>
      </footer>
    </div>
  );
}
