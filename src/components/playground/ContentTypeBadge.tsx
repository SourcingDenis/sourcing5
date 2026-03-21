import type { ContentType } from '@/modules/playground/types';
import { cn } from '@/lib/utils/helpers';

const BADGE_STYLES: Record<ContentType, string> = {
  subject_line: 'bg-blue-100 text-blue-700',
  email_body: 'bg-green-100 text-green-700',
  follow_up: 'bg-amber-100 text-amber-700',
  inmail: 'bg-purple-100 text-purple-700',
};

const BADGE_LABELS: Record<ContentType, string> = {
  subject_line: 'Subject Line',
  email_body: 'Email Body',
  follow_up: 'Follow-up',
  inmail: 'InMail',
};

interface ContentTypeBadgeProps {
  type: ContentType;
  className?: string;
}

export function ContentTypeBadge({ type, className }: ContentTypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
        BADGE_STYLES[type],
        className
      )}
    >
      {BADGE_LABELS[type]}
    </span>
  );
}
