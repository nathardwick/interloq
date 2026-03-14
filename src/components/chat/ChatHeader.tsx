'use client';

import { Avatar, Badge } from '@/components/ui';
import type { SimulationData } from '@/hooks/useChat';

interface ChatHeaderProps {
  simulation: SimulationData;
}

function statusVariant(status: string): 'active' | 'paused' | 'completed' {
  if (status === 'active') return 'active';
  if (status === 'paused') return 'paused';
  return 'completed';
}

export function ChatHeader({ simulation }: ChatHeaderProps) {
  const startDate = new Date(simulation.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={simulation.clientPersona.name} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">
            {simulation.clientPersona.name}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {simulation.clientPersona.role} — {simulation.organisationProfile.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-4">
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="level">L{simulation.level}</Badge>
          <Badge variant="difficulty">{simulation.difficultyLevel}</Badge>
        </div>
        <Badge variant={statusVariant(simulation.status)}>{simulation.status}</Badge>
        <span className="text-[11px] text-slate-400 hidden md:inline ml-1">
          Started {startDate}
        </span>
      </div>
    </div>
  );
}
