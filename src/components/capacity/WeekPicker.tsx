'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { getWeekStartDate } from '@/lib/utils/helpers';

interface WeekPickerProps {
  currentWeekStart: string; // "YYYY-MM-DD"
}

export function WeekPicker({ currentWeekStart }: WeekPickerProps) {
  const router = useRouter();

  function navigate(offsetWeeks: number) {
    const d = new Date(currentWeekStart + 'T00:00:00');
    d.setDate(d.getDate() + offsetWeeks * 7);
    const newWeek = d.toISOString().split('T')[0];
    router.push(`/capacity/weekly?week=${newWeek}`);
  }

  function goToCurrent() {
    const current = getWeekStartDate(new Date()).toISOString().split('T')[0];
    router.push(`/capacity/weekly?week=${current}`);
  }

  const displayDate = new Date(currentWeekStart + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => navigate(-1)}>
        ← Prev
      </Button>
      <span className="min-w-[190px] text-center text-sm font-medium text-slate-700">
        Week of {displayDate}
      </span>
      <Button size="sm" variant="outline" onClick={() => navigate(1)}>
        Next →
      </Button>
      <Button size="sm" variant="secondary" onClick={goToCurrent}>
        This Week
      </Button>
    </div>
  );
}
