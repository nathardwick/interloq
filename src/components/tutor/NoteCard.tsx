'use client';

import { Card } from '@/components/ui';
import { Pin } from 'lucide-react';

export interface TutorNoteData {
  _id: string;
  simulationId: string;
  tutorId: string;
  content: string;
  messageId: string | null;
  createdAt: string;
}

interface NoteCardProps {
  note: TutorNoteData;
  pinnedMessagePreview?: string;
}

function formatNoteTime(dateStr: string): string {
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
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NoteCard({ note, pinnedMessagePreview }: NoteCardProps) {
  return (
    <Card className="p-3">
      {pinnedMessagePreview && (
        <div className="flex items-start gap-1.5 mb-2 text-[11px] text-slate-400">
          <Pin size={11} className="shrink-0 mt-0.5" />
          <p className="truncate">{pinnedMessagePreview}</p>
        </div>
      )}
      <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
        {note.content}
      </p>
      <p className="text-[11px] text-slate-400 mt-2">
        {formatNoteTime(note.createdAt)}
      </p>
    </Card>
  );
}
