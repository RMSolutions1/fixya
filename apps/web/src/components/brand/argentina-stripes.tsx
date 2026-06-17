import { cn } from '@/lib/utils';

export function ArgentinaStripes({
  className,
  variant = 'horizontal',
}: {
  className?: string;
  variant?: 'horizontal' | 'vertical';
}) {
  return (
    <div
      className={cn(
        variant === 'horizontal' ? 'h-1 w-full' : 'h-full w-1',
        'stripes-argentina',
        className,
      )}
      aria-hidden
    />
  );
}
