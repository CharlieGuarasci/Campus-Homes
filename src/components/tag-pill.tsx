import { cn } from '@/lib/utils';

interface TagPillProps {
  label: string;
  className?: string;
}

export function TagPill({ label, className }: TagPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md bg-[#F0F0EE] px-2 py-0.5 text-xs font-medium text-[#6B6B6B]',
        className
      )}
    >
      {label}
    </span>
  );
}
