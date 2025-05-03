'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, Upload, Download, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import background from '@/public/images/landing-bg.png';
import productExampleFront from '@/public/images/product-example-front.png';
import productExampleLeft from '@/public/images/product-example-left.png';
import productExampleRight from '@/public/images/product-example-right.png';
import Image from 'next/image';

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className='flex min-h-screen flex-col'>
      <Image
        alt='background'
        src={background}
        placeholder='blur'
        quality={100}
        fill
        sizes='200vh'
        className='brightness-90'
        style={{
          objectFit: 'cover',
          zIndex: -100,
          minHeight: '200vh',
        }}
      />
      <main>
        <section id='intro' className='h-full'>
          <section className='px-4 py-12'>
            <div className='container mx-auto max-w-5xl text-center'>
              <h1 className='mb-6 text-4xl font-bold md:text-6xl'>
                {t('landing.title')}
                <br />
                <span className='text-primary underline'>
                  {t('landing.titleHighlight')}
                </span>
              </h1>
              {/* <p className='mx-auto mb-10 max-w-3xl rounded-lg bg-violet-500/80 p-4 text-xl text-foreground'>
                {t('landing.subtitle')}
              </p> */}
              <Link href='/planner'>
                <Button id='call-to-action' size='lg' className='gap-2'>
                  <Calendar className='h-5 w-5' />
                  {t('landing.startPlanning')}
                </Button>
              </Link>
            </div>
          </section>

          <section
            id='product-example'
            className='border-12 flex items-center justify-center'
          >
            <div className='relative'>
              <div className='relative hover:scale-105 transition-transform duration-300'>
                <Image
                  alt='product example front'
                  src={productExampleFront}
                  placeholder='blur'
                  className='z-10 rounded-2xl border-[12px] border-transparent'
                  quality={100}
                  height={430}
                  width={717}
                />
                <div
                  id='boarder-gradient'
                  className='absolute bottom-0 left-0 right-0 top-0 z-[-1] rounded-2xl border-primary shadow-xl'
                  style={{
                    background: 'linear-gradient(#FFFFFF, #25C9F2)',
                  }}
                />
              </div>
              <Image
                alt='product example left'
                src={productExampleLeft}
                placeholder='blur'
                className='absolute bottom-5 left-[-400px] z-[-2] -rotate-6 shadow-lg'
                quality={100}
                height={297}
                width={717}
              />
              <Image
                alt='product example right'
                src={productExampleRight}
                placeholder='blur'
                className='absolute bottom-3 right-[-400px] z-[-2] rotate-6 shadow-lg'
                quality={100}
                height={357}
                width={596}
              />
            </div>
          </section>
        </section>

        <section id='features' className='h-screen'></section>
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
