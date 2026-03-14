'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, onClick, className = '' }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-slate-200 bg-white p-5 ${
        onClick ? 'cursor-pointer hover:border-slate-300 transition-colors' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
