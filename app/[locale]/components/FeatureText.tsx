import { FC, PropsWithChildren } from 'react';
import { cn } from '@/lib/colour-utils';

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
