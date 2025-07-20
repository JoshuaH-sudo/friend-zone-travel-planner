'use client';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, Clock10, Users, Globe2, FileClock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion, useScroll } from 'motion/react';
import productExampleFirst from '@/public/images/product-example-front.png';
import productExampleThird from '@/public/images/product-example-left.png';
import productExampleSecond from '@/public/images/product-example-right.png';
import availabilityOverviewFeature from '@/public/images/features/availability-overview-feature.png';
import friendManagementFeature from '@/public/images/features/friend-management-feature.png';
import timezoneFeature from '@/public/images/features/timezone-feature.png';
import exportCalendarFeature from '@/public/images/features/export-calendar-feature.png';
import path1 from '@/public/images/paths/path-1.svg';
import path2 from '@/public/images/paths/path-2.svg';
import path3 from '@/public/images/paths/path-3.svg';
import path4 from '@/public/images/paths/path-4.svg';
import mouseIndicator from '@/public/images/mouse-indicator.svg';
import xIndicator from '@/public/images/x-indicator.svg';
import WordFrame from './components/WordFrame';
import FeatureFrame from './components/FeatureFrame';
import FeatureText from './components/FeatureText';
import Footer from './components/Footer';
import { FeatureShortcuts } from './components/FeatureShortcuts';
import { Header } from './components/header/header';

export default function LandingPage() {
  const t = useTranslations('landing');
  const { scrollYProgress } = useScroll();

  return (
    <>
      <Header />
      <main
        className='pt-20'
        style={{
          background:
            'linear-gradient(180deg, #0084FF 0%, #C5F1FF 50%, #D5C5FF 100%), white',
        }}
      >
        <motion.div
          id='scroll-indicator'
          style={{
            scaleX: scrollYProgress,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            originX: 0,
            zIndex: 100,
            backgroundColor: '#a2ff9e',
          }}
        />
        <section
          id='intro'
          className='flex h-screen flex-row justify-between px-10 pt-10'
        >
          <div id='text' className='relative px-4 py-12'>
            <div className='container mx-auto flex max-w-5xl flex-col items-center gap-3 text-center'>
              <h1 className="flex flex-col items-center justify-center font-['Roboto'] text-4xl font-bold md:text-6xl">
                <div className='flex items-center justify-center gap-3'>
                  <WordFrame>{t('separated')}</WordFrame>
                  <WordFrame>{t('by')}</WordFrame>
                  <WordFrame>{t('borders')}</WordFrame>
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
                  <span className='font-extrabold leading-[64px] text-white [text-shadow:0px_4px_4px_rgb(0_0_0/0.25)]'>
                    {t('connectedBy')}
                  </span>
                  <span className='font-extrabold leading-[64px] text-green-300 [text-shadow:0px_4px_4px_rgb(0_0_0/0.25)]'>
                    {t('friendZone')}
                  </span>
                </div>
              </h1>
              <p className='w-[506px] justify-start text-center text-3xl font-semibold text-neutral-900'>
                {t('description')}
              </p>
              <Link href='/signin'>
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
                  src={mouseIndicator}
                  alt='Mouse Indicator'
                  width={40}
                  height={80}
                />
                <Image
                  src={xIndicator}
                  alt='X Indicator'
                  width={40}
                  height={40}
                />
              </div>
              <Image src={path1} alt='path-1' width={62} height={168} />
            </div>
          </div>

          <div className='flex flex-col items-center justify-center gap-4 self-end'>
            <FeatureShortcuts />
            <div
              id='example-photos'
              className='relative'
              style={{ width: '717px', height: '428px' }}
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className='absolute bottom-0 z-10'
              >
                <Image
                  src={productExampleFirst}
                  alt='first-example'
                  width={717}
                  height={428}
                  className='rounded-md outline-solid outline-4 outline-white'
                />
              </motion.div>

              <motion.div
                initial={{ rotate: 0, x: -50, opacity: 0 }}
                animate={{ rotate: -4.317, x: -100, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.4 }}
                className='absolute bottom-0 z-1'
              >
                <Image
                  src={productExampleSecond}
                  alt='second-example'
                  width={596}
                  height={367}
                />
              </motion.div>

              <motion.div
                initial={{ rotate: 0, x: -50, opacity: 0 }}
                animate={{ rotate: -6.962, x: -180, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.7 }}
                className='absolute bottom-0 z-0'
              >
                <Image
                  src={productExampleThird}
                  alt='third-example'
                  width={782}
                  height={551}
                />
              </motion.div>
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
                imageSrc={availabilityOverviewFeature}
                imageAlt='availability overview example'
              />
              <div
                id='path-2'
                className='absolute bottom-[-15px] right-[-450px] z-0'
              >
                <Image src={path2} alt='path-2' width={443.5} height={200} />
              </div>
            </div>
            <FeatureText shadowDirection='right'>
              {t('feature.availabilityOverview.description')}
            </FeatureText>
          </div>

          <div className='flex flex-row justify-center gap-16'>
            <FeatureText>
              {t('feature.friendManagement.description')}
            </FeatureText>
            <div className='relative'>
              <FeatureFrame
                title={t('feature.friendManagement.title')}
                Icon={Users}
                imageSrc={friendManagementFeature}
                imageAlt='Friend Management example'
                shadowDirection='right'
              />
              <div
                id='path-3'
                className='absolute bottom-[-150px] left-[-580px] z-0'
              >
                <Image src={path3} alt='path-3' width={573.5} height={278.08} />
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
                imageSrc={timezoneFeature}
                imageAlt='Timezone Support example'
              />
              <div
                id='path-4'
                className='absolute bottom-[-10px] right-[-450px] z-0'
              >
                <Image src={path4} alt='path-4' width={443.5} height={165.37} />
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
              imageSrc={exportCalendarFeature}
              imageAlt='Export Calendar example'
              shadowDirection='right'
            />
          </div>
        </section>

        <section
          id='last-call-to-action'
          className='flex h-96 flex-col items-center justify-center gap-6 px-32'
        >
          <h2 className="font-['Roboto'] text-4xl font-bold leading-[64px] text-black md:text-6xl">
            {t('whatYouWaitingFor')}
          </h2>
          <h2 className="font-['Roboto'] text-4xl font-bold leading-[64px] text-black md:text-6xl">
            {t('letsPlanThatTrip')}
          </h2>
          <Link href='/signin'>
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
        </section>

        <Footer />
      </main>
    </>
  );
}
