'use client';

import { useRouter } from 'next/navigation';
import { Logo, Badge, Avatar } from '@/components/ui';

interface HeaderProps {
  userName: string;
  userRole: 'student' | 'tutor';
  onToggleSidebar: () => void;
}

export function Header({ userName, userRole, onToggleSidebar }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors"
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <Logo size="md" />
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2">
          <Avatar name={userName} size="sm" />
          <span className="text-sm text-slate-700">{userName}</span>
          <Badge variant={userRole === 'tutor' ? 'level' : 'default'}>
            {userRole}
          </Badge>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
