'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock10, FileClock, Globe2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import productExampleFront from '@/public/images/product-example-front.png';
import productExampleLeft from '@/public/images/product-example-left.png';
import productExampleRight from '@/public/images/product-example-right.png';
import Image from 'next/image';
import Path1 from '@/public/images/paths/path-1.svg';
import Path2 from '@/public/images/paths/path-2.svg';
import Path3 from '@/public/images/paths/path-3.svg';
import Path4 from '@/public/images/paths/path-4.svg';
import MouseIndicator from '@/public/images/mouse-indicator.svg';
import XIndicator from '@/public/images/x-indicator.svg';
import WordFrame from './components/WordFrame';
import FeatureFrame from './components/FeatureFrame';
import FeatureText from './components/FeatureText';
import Footer from './components/Footer';

export default function LandingPage() {
  const t = useTranslations('landing');

  return (
    <main
      className='pt-20'
      style={{
        background:
          'linear-gradient(180deg, #0084FF 0%, #C5F1FF 50%, #D5C5FF 100%), white',
      }}
    >
      <section
        id='intro'
        className='flex h-screen flex-row justify-between px-10 pt-10'
      >
        <div id='text' className='relative px-4 py-12'>
          <div className='container mx-auto flex max-w-5xl flex-col items-center gap-3 text-center'>
            <h1 className="flex flex-col items-center justify-center font-['Roboto'] text-4xl font-bold md:text-6xl">
              <div className='flex items-center justify-center gap-3'>
                <WordFrame>Separated</WordFrame>
                <WordFrame>By</WordFrame>
                <WordFrame>Borders</WordFrame>
              </div>
              <div
                className='h-20 justify-start self-stretch whitespace-nowrap text-center'
                style={{
                  WebkitTextStrokeWidth: '3px',
                  WebkitTextStrokeColor: '#30002B',
                  paintOrder: 'stroke fill',
                  fontWeight: '800',
                }}
              >
                <span className='font-extrabold leading-[64px] text-white [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]'>
                  {t('connectedBy')}
                </span>
                <span className='font-extrabold leading-[64px] text-green-300 [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]'>
                  {t('friendZone')}
                </span>
              </div>
            </h1>
            <p className='w-[506px] justify-start text-center text-3xl font-semibold text-neutral-900'>
              {t('description')}
            </p>
            <Link href='/planner'>
              <Button
                id='call-to-action'
                size='lg'
                className='gap-2 bg-white text-black shadow-[4px_4px_0px_0px_rgba(162,255,158,1.00)] transition-all hover:bg-slate-100 hover:shadow-[8px_8px_0px_0px_rgba(162,255,158,1.00)] focus:translate-x-1 focus:translate-y-1 focus:shadow-none'
                style={{
                  borderRadius: '6px',
                  border: '2px solid var(--Border---Dark, #262626)',
                }}
              >
                <Calendar className='h-5 w-5' />
                {t('startPlanning')}
              </Button>
            </Link>
          </div>
          <div
            id='start-path-1'
            className='absolute bottom-[-30px] right-[50%] z-0 flex flex-col justify-center'
          >
            <div className='absolute right-[-18px] top-[-120px] z-10 flex flex-col items-center justify-center gap-1'>
              <Image
                src={MouseIndicator}
                alt='Mouse Indicator'
                width={40}
                height={80}
              />
              <Image
                src={XIndicator}
                alt='X Indicator'
                width={40}
                height={40}
              />
            </div>
            <Image src={Path1} alt='path-1' width={62} height={168} />
          </div>
        </div>

        <div id='example-photos' className='self-end'>
          <div className='relative' style={{ width: '717px', height: '428px' }}>
            <Image
              src={productExampleFront}
              alt='first-example'
              width={717}
              height={428}
              className='absolute bottom-0 z-10 rounded-md outline outline-4 outline-white'
            />

            <Image
              src={productExampleRight}
              alt='first-example'
              width={596}
              height={367}
              className='absolute bottom-0 left-[-100] z-[1]'
              style={{
                transform: 'rotate(-4.317deg)',
              }}
            />

            <Image
              src={productExampleLeft}
              alt='first-example'
              width={782}
              height={551}
              className='absolute bottom-0 left-[-180] z-[0]'
              style={{
                transform: 'rotate(-6.962deg)',
              }}
            />
          </div>
        </div>
      </section>

      <section
        id='features-1'
        className='flex h-screen flex-col justify-center gap-6 px-32'
      >
        <div className='flex flex-row justify-center gap-16'>
          <div className='relative'>
            <FeatureFrame
              title={t('feature.availabilityOverview.title')}
              Icon={Clock10}
              imageSrc={productExampleRight}
              imageAlt='availability overview example'
            />
            <div
              id='path-2'
              className='absolute bottom-[-15px] right-[-450px] z-0'
            >
              <Image src={Path2} alt='path-2' width={443.5} height={200} />
            </div>
          </div>
          <FeatureText shadowDirection='right'>
            {t('feature.availabilityOverview.description')}
          </FeatureText>
        </div>

        <div className='flex flex-row justify-center gap-16'>
          <FeatureText>{t('feature.friendManagement.description')}</FeatureText>
          <div className='relative'>
            <FeatureFrame
              title={t('feature.friendManagement.title')}
              Icon={Users}
              imageSrc={productExampleRight}
              imageAlt='Friend Management example'
              shadowDirection='right'
            />
            <div
              id='path-3'
              className='absolute bottom-[-150px] left-[-580px] z-0'
            >
              <Image src={Path3} alt='path-3' width={573.5} height={278.08} />
            </div>
          </div>
        </div>
      </section>

      <section
        id='features-2'
        className='flex h-screen flex-col justify-center gap-6 px-32 pt-20'
      >
        <div className='flex flex-row justify-center gap-16'>
          <div className='relative'>
            <FeatureFrame
              title={t('feature.timezoneSupport.title')}
              Icon={Globe2}
              imageSrc={productExampleRight}
              imageAlt='Timezone Support example'
            />
            <div
              id='path-4'
              className='absolute bottom-[-10px] right-[-450px] z-0'
            >
              <Image src={Path4} alt='path-4' width={443.5} height={165.37} />
            </div>
          </div>
          <FeatureText shadowDirection='right'>
            {t('feature.timezoneSupport.description')}
          </FeatureText>
        </div>

        <div className='flex flex-row justify-center gap-16'>
          <FeatureText>{t('feature.calendarExport.description')}</FeatureText>
          <FeatureFrame
            title={t('feature.calendarExport.title')}
            Icon={FileClock}
            imageSrc={productExampleRight}
            imageAlt='Export Calendar example'
            shadowDirection='right'
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
