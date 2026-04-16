import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectNativeProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

const SelectNative = React.forwardRef<HTMLSelectElement, SelectNativeProps>(
  ({ className, options, placeholder, value, ...props }, ref) => {
    return (
      <select
        ref={ref}
        value={value}
        className={cn(
          'h-9 w-auto min-w-[140px] rounded-lg border border-border bg-card px-3 text-sm text-foreground',
          'outline-none transition-colors',
          'hover:border-primary/50',
          'focus:border-primary focus:ring-2 focus:ring-primary/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          '[&>option]:bg-popover [&>option]:text-popover-foreground',
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="__all__">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);

SelectNative.displayName = 'SelectNative';

export { SelectNative };
