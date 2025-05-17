'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Users,
  Clock10,
  LucideProps,
  FileClock,
  Globe2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import productExampleFront from '@/public/images/product-example-front.png';
import productExampleLeft from '@/public/images/product-example-left.png';
import productExampleRight from '@/public/images/product-example-right.png';
import Image, { StaticImageData } from 'next/image';
import {
  FC,
  ForwardRefExoticComponent,
  PropsWithChildren,
  RefAttributes,
} from 'react';
import { cn } from '@/lib/colour-utils';
import Path1 from '@/public/images/paths/path-1.svg';
import Path2 from '@/public/images/paths/path-2.svg';
import Path3 from '@/public/images/paths/path-3.svg';
import Path4 from '@/public/images/paths/path-4.svg';
import MouseIndicator from '@/public/images/mouse-indicator.svg';
import XIndicator from '@/public/images/x-indicator.svg';

export default function LandingPage() {
  const t = useTranslations();

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
                className='h-20 justify-start self-stretch text-center'
                style={{
                  WebkitTextStrokeWidth: '3px',
                  WebkitTextStrokeColor: '#30002B',
                  paintOrder: 'stroke fill',
                  fontWeight: '800',
                }}
              >
                <span className='font-extrabold leading-[64px] text-white [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]'>
                  connected-by-
                </span>
                <span className='font-extrabold leading-[64px] text-green-300 [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]'>
                  Friend-zone
                </span>
              </div>
            </h1>
            <p className='w-[506px] justify-start text-center text-3xl font-semibold text-neutral-900'>
              Plan, organise and meet with friends effortlessly - no matter
              where they are.
            </p>
            <Link href='/planner'>
              <Button
                id='call-to-action'
                size='lg'
                className='gap-2 bg-white shadow-[4px_4px_0px_0px_rgba(162,255,158,1.00)] transition-all hover:bg-slate-100 hover:shadow-[8px_8px_0px_0px_rgba(162,255,158,1.00)] focus:translate-x-1 focus:translate-y-1 focus:shadow-none'
                style={{
                  borderRadius: '6px',
                  border: '2px solid var(--Border---Dark, #262626)',
                }}
              >
                <Calendar className='h-5 w-5' />
                {t('landing.startPlanning')}
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
              title='Availability Overview'
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
            Compare all your friends availabilities in an easy to see and
            exportable calendar.
          </FeatureText>
        </div>

        <div className='flex flex-row justify-center gap-16'>
          <FeatureText>
            Add your friends and let{' '}
            <span className='text-sky-600'>Friend-zone</span> sort out all the
            hassle with thinking about what timezone they are in.
          </FeatureText>
          <div className='relative'>
            <FeatureFrame
              title='Friend Management'
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
              title='Timezone Support'
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
            No more asking, “what time is it over there?” Let{' '}
            <span className='text-sky-600'>Friend-zone</span> answer it for you.
          </FeatureText>
        </div>

        <div className='flex flex-row justify-center gap-16'>
          <FeatureText>
            Once your all done, export and share it to all your friends with
            screenshots or iCal files.
          </FeatureText>
          <FeatureFrame
            title='Export to iCal'
            Icon={FileClock}
            imageSrc={productExampleRight}
            imageAlt='Export to iCal example'
            shadowDirection='right'
          />
        </div>
      </section>

      <footer className='h-24 border-t bg-green-300 py-1'>
        <div className='container mx-auto flex justify-end px-4 text-end align-bottom text-black'>
          <a
            href='https://www.flaticon.com/free-icons/travel'
            title='travel icons'
          >
            Travel icons created by Freepik - Flaticon
          </a>
        </div>
      </footer>
    </main>
  );
}

const WordFrame: FC<PropsWithChildren> = ({ children }) => (
  <div className='inline-flex items-center justify-center gap-2.5 rounded-xl p-3 outline-dashed outline-[3px] outline-offset-[-3px] outline-pink-950'>
    <div
      className="justify-start text-center font-['Roboto'] text-6xl font-extrabold leading-[64px] text-white [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]"
      style={{
        WebkitTextStrokeWidth: '3px',
        WebkitTextStrokeColor: '#30002B',
        paintOrder: 'stroke fill',
        fontWeight: '800',
      }}
    >
      {children}
    </div>
  </div>
);

export interface FeatureFrameProps {
  title: string;
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >;
  imageSrc: StaticImageData;
  imageAlt: string;
  shadowDirection?: 'left' | 'right';
  className?: string;
}

export const FeatureFrame: FC<FeatureFrameProps> = ({
  title,
  Icon,
  imageSrc,
  imageAlt,
  shadowDirection = 'left',
  className,
}) => {
  const leftShadowClassName = 'shadow-[-12px_12px_4px_0px_rgb(0_0_0_/_0.25)]';
  const rightShadowClassName = 'shadow-[12px_12px_4px_0px_rgb(0_0_0_/_0.25)]';
  const shadowClassName =
    shadowDirection === 'left' ? leftShadowClassName : rightShadowClassName;
  return (
    <div
      className={cn(
        'inline-flex w-[472px] flex-col items-start justify-center gap-3 overflow-hidden rounded-xl bg-white px-6 py-8',
        shadowClassName,
        className
      )}
    >
      <div className='flex h-72 flex-col items-start justify-start gap-4 self-stretch'>
        <div className='inline-flex items-center justify-start gap-2.5'>
          <div className='relative inline-flex flex-col items-start justify-between overflow-hidden rounded-full bg-black p-1 shadow-[-2px_2px_0px_0px_rgba(0,203,51,1.00)]'>
            <Icon />
          </div>
          <div className="justify-start font-['Roboto'] text-3xl font-semibold leading-9 text-black">
            {title}
          </div>
        </div>
        <Image src={imageSrc} alt={imageAlt} width={717} height={428} />
      </div>
    </div>
  );
};

export interface FeatureTextProps extends PropsWithChildren {
  shadowDirection?: 'left' | 'right';
  className?: string;
}
export const FeatureText: FC<FeatureTextProps> = ({
  shadowDirection = 'left',
  className,
  children,
}) => {
  const leftShadowClassName = 'shadow-[-12px_12px_4px_0px_rgb(0_0_0_/_0.25)]';
  const rightShadowClassName = 'shadow-[12px_12px_4px_0px_rgb(0_0_0_/_0.25)]';
  const shadowClassName =
    shadowDirection === 'left' ? leftShadowClassName : rightShadowClassName;

  return (
    <div
      className={cn(
        'inline-flex h-fit w-[639px] flex-grow-0 flex-col items-center justify-center gap-2.5 rounded-3xl border-2 bg-white/90 px-4 py-6',
        shadowClassName,
        className
      )}
    >
      <p className="justify-start font-['Roboto'] text-2xl font-semibold text-neutral-900">
        {children}
      </p>
    </div>
  );
};
