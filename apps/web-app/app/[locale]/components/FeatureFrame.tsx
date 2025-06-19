import { FC, ForwardRefExoticComponent, RefAttributes } from 'react';
import { LucideProps } from 'lucide-react';
import Image, { StaticImageData } from 'next/image';
import { cn } from '@/lib/utils';

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

const FeatureFrame: FC<FeatureFrameProps> = ({
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
          <div className='relative inline-flex flex-col items-start justify-between overflow-hidden rounded-full bg-black p-1 text-white shadow-[-2px_2px_0px_0px_rgba(0,203,51,1.00)]'>
            <Icon />
          </div>
          <div className="justify-start font-['Roboto'] text-3xl font-semibold leading-9 text-black">
            {title}
          </div>
        </div>
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={717}
          height={428}
          objectFit='fit'
          className='rounded-xl'
        />
      </div>
    </div>
  );
};

export default FeatureFrame;
