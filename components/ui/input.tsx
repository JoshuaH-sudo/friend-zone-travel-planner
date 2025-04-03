import * as React from 'react';
import { cn } from '@/lib/utils';
import { XIcon } from 'lucide-react';
import { Button } from './button';

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & { isLoading?: boolean; clearable?: boolean }
>(({ className, type, isLoading, clearable, ...props }, ref) => {
  const handleClear = () => {
    if (props.onChange) {
      props.onChange({
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className='relative flex items-center'>
      <input
        type={type}
        className={cn(
          'peer flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        placeholder={props.placeholder || ' '}
        {...props}
      />
      {clearable && (
        <Button
          id='clear-button'
          aria-label='Clear'
          disabled={isLoading}
          type='button'
          variant='ghost'
          size='icon'
          className={cn(
            'absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
            'peer-placeholder-shown:pointer-events-none peer-placeholder-shown:opacity-0'
          )}
          onClick={handleClear}
        >
          <XIcon className='h-4 w-4' />
          <span className='sr-only'>Clear</span>
        </Button>
      )}
      {isLoading && (
        <div className='absolute right-2'>
          <div className='h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent'></div>
        </div>
      )}
    </div>
  );
});
Input.displayName = 'Input';

export { Input };
