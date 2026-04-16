import * as React from 'react';
import { cn } from '@/lib/utils';

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ShineBorder = React.forwardRef<HTMLDivElement, ShineBorderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.05)]',
          'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
          'before:absolute before:inset-0 before:rounded-2xl before:p-[1px]',
          'before:bg-[conic-gradient(from_var(--shine-angle),transparent_60%,hsl(var(--senior-green)/0.15)_75%,transparent_90%)]',
          'before:animate-shine before:-z-10',
          className,
        )}
        style={{ '--shine-angle': '0deg' } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ShineBorder.displayName = 'ShineBorder';

export { ShineBorder };
