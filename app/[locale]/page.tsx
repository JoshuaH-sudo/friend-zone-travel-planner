'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Users,
  Clock,
  Upload,
  Download,
  Globe,
  Clock10,
  LucideProps,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import background from '@/public/images/landing-bg.png';
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
        <div id='text' className='px-4 py-12'>
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
                className='gap-2'
                style={{
                  borderRadius: '6px',
                  border: '2px solid var(--Border---Dark, #262626)',
                  background: '#FAFAFA',
                  boxShadow: '4px 4px 0px 0px #A2FF9E',
                }}
              >
                <Calendar className='h-5 w-5' />
                {t('landing.startPlanning')}
              </Button>
            </Link>
          </div>
        </div>

        <div id='example-photos' className='self-end pb-20'>
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
        className='flex h-screen flex-col justify-center gap-6 px-32 pt-20'
      >
        <div
          style={{
            gridTemplateAreas: '"image text"',
            height: 'fit-content',
          }}
          className='grid grid-cols-2 gap-6'
        >
          <FeatureFrame
            title='Availability Overview'
            Icon={Clock10}
            imageSrc={productExampleRight}
            imageAlt='availability overview example'
          />
          <FeatureText>
            Compare all your friends availabilities in an easy to see and
            exportable calendar.
          </FeatureText>
        </div>
        <div
          style={{
            gridTemplateAreas: '"text image"',
            height: 'fit-content',
          }}
          className='grid grid-cols-2 gap-6'
        >
          <FeatureText>
            Add your friends and let Friend-zone sort out all the hassle with
            thinking about what timezone they are in.
          </FeatureText>
          <FeatureFrame
            title='Friend Management'
            Icon={Clock10}
            imageSrc={productExampleRight}
            imageAlt='Friend Management example'
          />
        </div>
      </section>

      <section
        id='features-2'
        className='flex h-screen flex-col justify-center gap-6 px-32 pt-20'
      >
        <div className='grid grid-cols-2'>
          <FeatureFrame
            title='Timezone Support'
            Icon={Clock10}
            imageSrc={productExampleRight}
            imageAlt='Timezone Support example'
          />
          <FeatureText>
            No more asking, “what time is it over there?” Let Friend-zone answer
            it for you.
          </FeatureText>
        </div>
        <div className='grid grid-cols-2'>
          <FeatureText>
            Once your all done, export and share it to all your friends with
            screenshots or iCal files.
          </FeatureText>
          <FeatureFrame
            title='Export to iCal'
            Icon={Clock10}
            imageSrc={productExampleRight}
            imageAlt='Export to iCal example'
          />
        </div>
      </section>

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
}

const FeatureFrame: FC<FeatureFrameProps> = ({
  title,
  Icon,
  imageSrc,
  imageAlt,
}) => (
  <div
    style={{
      gridArea: 'image',
    }}
    className='inline-flex w-[472px] flex-col items-start justify-center gap-3 overflow-hidden rounded-xl bg-white px-6 py-6 shadow-[-12px_12px_4px_0px_rgba(0,0,0,0.25)]'
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

const FeatureText: FC<PropsWithChildren> = ({ children }) => (
  <div
    style={{
      gridArea: 'text',
    }}
    className='inline-flex flex-grow-0 flex-col items-center justify-center gap-2.5 rounded-3xl bg-white/90 px-4 py-6 shadow-[12px_12px_4px_0px_rgba(0,0,0,0.25)] outline outline-2 outline-offset-[-2px] outline-black'
  >
    <p className="justify-start font-['Roboto'] text-2xl font-semibold text-neutral-900">
      {children}
    </p>
  </div>
);
