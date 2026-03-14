'use client';

const sizes = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
} as const;

interface LogoProps {
  size?: keyof typeof sizes;
}

export function Logo({ size = 'md' }: LogoProps) {
  return (
    <span className={`tracking-tight ${sizes[size]}`}>
      <span className="font-medium" style={{ color: '#2b2b2b' }}>interlo</span>
      <span className="font-bold" style={{ color: '#1074ef' }}>Q</span>
    </span>
  );
}
