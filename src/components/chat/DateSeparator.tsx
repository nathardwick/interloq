'use client';

interface DateSeparatorProps {
  date: string;
}

function formatSeparatorDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 border-t border-slate-200" />
      <span className="text-[11px] text-slate-400 font-medium">
        {formatSeparatorDate(date)}
      </span>
      <div className="flex-1 border-t border-slate-200" />
    </div>
  );
}
