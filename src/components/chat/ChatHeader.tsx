'use client';

import { useState } from 'react';
import { Avatar, Badge, Button, Modal } from '@/components/ui';
import type { SimulationData } from '@/hooks/useChat';

interface ChatHeaderProps {
  simulation: SimulationData;
  onComplete?: () => Promise<void>;
}

function statusVariant(status: string): 'active' | 'paused' | 'completed' {
  if (status === 'active') return 'active';
  if (status === 'paused') return 'paused';
  return 'completed';
}

export function ChatHeader({ simulation, onComplete }: ChatHeaderProps) {
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const startDate = new Date(simulation.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleComplete = async () => {
    await onComplete?.();
    setShowCompleteModal(false);
  };

  return (
    <>
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
          {onComplete && simulation.status === 'active' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCompleteModal(true)}
            >
              Complete
            </Button>
          )}
        </div>
      </div>

      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete simulation"
      >
        <p className="text-sm text-slate-600 mb-5">
          Are you sure? You won&apos;t be able to send further messages.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowCompleteModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleComplete}>
            Complete
          </Button>
        </div>
      </Modal>
    </>
  );
}
