'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { NoteCard, type TutorNoteData } from './NoteCard';
import type { ChatMessage } from '@/hooks/useChat';
import { Pin, X, StickyNote } from 'lucide-react';

interface NotesPanelProps {
  simulationId: string;
  notes: TutorNoteData[];
  messages: ChatMessage[];
  selectedMessageId: string | null;
  onClearSelection: () => void;
  onNoteCreated: (note: TutorNoteData) => void;
}

export function NotesPanel({
  simulationId,
  notes,
  messages,
  selectedMessageId,
  onClearSelection,
  onNoteCreated,
}: NotesPanelProps) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedMessage = selectedMessageId
    ? messages.find((m) => m._id === selectedMessageId)
    : null;

  function getMessagePreview(messageId: string): string | undefined {
    const msg = messages.find((m) => m._id === messageId);
    if (!msg) return undefined;
    const preview = msg.content.slice(0, 80);
    return preview.length < msg.content.length ? `${preview}...` : preview;
  }

  async function handleSave() {
    if (!content.trim()) return;

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/tutor/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulationId,
          content: content.trim(),
          messageId: selectedMessageId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save note');
        return;
      }

      onNoteCreated(data.note);
      setContent('');
      onClearSelection();
    } catch {
      setError('Failed to save note');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-slate-200 px-4 py-3 shrink-0">
        <h2 className="text-sm font-semibold text-slate-900">Notes</h2>
        <p className="text-[11px] text-slate-400 mt-0.5">Private — not visible to students</p>
      </div>

      {/* Add note form */}
      <div className="p-4 border-b border-slate-200 shrink-0">
        {selectedMessage && (
          <div className="flex items-start gap-1.5 mb-2 rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1.5 text-xs text-blue-700">
            <Pin size={12} className="shrink-0 mt-0.5" />
            <p className="flex-1 min-w-0 truncate">
              Pinned to: {selectedMessage.content.slice(0, 60)}
              {selectedMessage.content.length > 60 ? '...' : ''}
            </p>
            <button
              onClick={onClearSelection}
              className="shrink-0 text-blue-400 hover:text-blue-600"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            selectedMessage
              ? 'Add a note about this message...'
              : 'Add a general note...'
          }
          rows={3}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none"
        />

        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}

        <div className="flex justify-end mt-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!content.trim() || saving}
            isLoading={saving}
          >
            Save Note
          </Button>
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-6">
            <StickyNote size={24} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs text-slate-400">
              No notes yet. Click a message to pin a note to it, or add a general note above.
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              pinnedMessagePreview={
                note.messageId ? getMessagePreview(note.messageId) : undefined
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
