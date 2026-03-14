'use client';

const COLOURS = [
  'bg-navy-700',
  'bg-slate-600',
  'bg-emerald-700',
  'bg-blue-700',
  'bg-purple-700',
  'bg-rose-700',
  'bg-amber-700',
  'bg-teal-700',
];

function colourFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLOURS[Math.abs(hash) % COLOURS.length];
}

const sizes = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
} as const;

interface AvatarProps {
  name: string;
  size?: keyof typeof sizes;
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  const bg = colourFromName(name);

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full text-white font-medium ${bg} ${sizes[size]}`}
    >
      {initial}
    </div>
  );
}
