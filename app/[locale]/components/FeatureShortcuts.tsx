'use client';

import { Clock10, Users, Globe2, FileClock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/colour-utils';
import { motion } from 'motion/react';

const features = [
  {
    name: 'availabilityOverview',
    icon: <Clock10 className='h-5 w-5 text-white' />,
  },
  {
    name: 'friendManagement',
    icon: <Users className='h-5 w-5 text-white' />,
  },
  {
    name: 'timezoneSupport',
    icon: <Globe2 className='h-5 w-5 text-white' />,
  },
  {
    name: 'calendarExport',
    icon: <FileClock className='h-5 w-5 text-white' />,
  },
];

export const FeatureShortcuts = () => {
  const t = useTranslations('landing');
  const [activeTab, setActiveTab] = useState('availabilityOverview');

  useEffect(() => {
    const interval = setInterval(() => {
      const currentIndex = features.findIndex((f) => f.name === activeTab);
      const nextIndex = (currentIndex + 1) % features.length;
      setActiveTab(features[nextIndex].name);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTab, features]);

  return (
    <div className='flex flex-row gap-4'>
      {features.map((feature) => (
        <div key={feature.name} className='relative'>
          <div
            data-hover='false'
            className={cn(
              'relative z-10 inline-flex h-24 w-24 flex-col items-center justify-center gap-2.5 rounded-xl p-1 transition-all hover:opacity-100',
              activeTab !== feature.name && 'opacity-50',
              activeTab === feature.name && 'scale-110 opacity-100'
            )}
          >
            <div className='relative flex flex-col items-start justify-start gap-2.5 overflow-hidden rounded-full bg-black p-1'>
              {feature.icon}
            </div>
            <div className="justify-start self-stretch hyphens-auto text-center font-['Roboto'] text-xs font-medium leading-none tracking-wide text-black">
              {t(`feature.${feature.name}.title`)}
            </div>
          </div>

          {activeTab === feature.name && (
            <motion.div
              layoutId='selectedFeature'
              transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
              className='absolute left-0 top-0 z-[1] h-24 w-24 rounded-xl bg-white'
            />
          )}
        </div>
      ))}
    </div>
  );
};
