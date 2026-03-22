import { cn } from '@/lib/utils';

interface TagPillProps {
  label: string;
  className?: string;
}

export function TagPill({ label, className }: TagPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100',
        className
      )}
    >
      {label}
    </span>
  );
}
