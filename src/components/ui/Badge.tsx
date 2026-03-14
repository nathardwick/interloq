'use client';

import { ReactNode } from 'react';

const variants = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
  level: 'bg-blue-50 text-blue-700 border-blue-200',
  difficulty: 'bg-purple-50 text-purple-700 border-purple-200',
  invited: 'bg-white text-amber-700 border-amber-300',
  default: 'bg-slate-50 text-slate-500 border-slate-200',
} as const;

interface BadgeProps {
  variant?: keyof typeof variants;
  children: ReactNode;
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${variants[variant]}`}>
      {children}
    </span>
  );
}
