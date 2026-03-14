'use client';

import { Badge } from '@/components/ui';
import { Clock, MessageSquare } from 'lucide-react';

export interface SimulationSummary {
  _id: string;
  subjectArea: string;
  level: number;
  organisationProfile: { name: string; sector: string };
  clientPersona: { name: string; role: string };
  difficultyLevel: string;
  status: string;
  exchangeCount: number;
  createdAt: string;
  lastActivity: string;
  studentId?: { _id: string; name: string; email: string };
}

export function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function statusVariant(status: string): 'active' | 'paused' | 'completed' {
  if (status === 'active') return 'active';
  if (status === 'paused') return 'paused';
  return 'completed';
}

export function SimulationRow({
  simulation,
  onClick,
  compact,
}: {
  simulation: SimulationSummary;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg border border-slate-200 bg-white cursor-pointer hover:border-slate-300 transition-colors ${
        compact ? 'px-3 py-2' : 'px-4 py-3'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-medium text-slate-900 truncate ${compact ? 'text-xs' : 'text-sm'}`}>
            {simulation.organisationProfile.name}
          </p>
          <Badge variant={statusVariant(simulation.status)}>{simulation.status}</Badge>
        </div>
        <p className={`text-slate-500 mt-0.5 truncate ${compact ? 'text-[11px]' : 'text-xs'}`}>
          {simulation.clientPersona.name} — {simulation.clientPersona.role}
        </p>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="level">L{simulation.level}</Badge>
            <Badge variant="difficulty">{simulation.difficultyLevel}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MessageSquare size={12} />
              {simulation.exchangeCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatRelativeTime(simulation.lastActivity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
