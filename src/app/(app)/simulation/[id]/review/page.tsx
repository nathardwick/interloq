'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Spinner } from '@/components/ui';
import { ChatHeader, MessageBubble, DateSeparator } from '@/components/chat';
import { NotesPanel, type TutorNoteData } from '@/components/tutor';
import type { SimulationData, ChatMessage } from '@/hooks/useChat';
import { ArrowLeft, Eye } from 'lucide-react';

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const simulationId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null!);

  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notes, setNotes] = useState<TutorNoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [simRes, notesRes] = await Promise.all([
          fetch(`/api/simulations/${simulationId}`),
          fetch(`/api/tutor/notes/${simulationId}`),
        ]);

        const simData = await simRes.json();

        if (!simRes.ok) {
          setError(simData.error || 'Failed to load simulation');
          return;
        }

        setSimulation(simData.simulation);
        setMessages(
          (simData.messages || []).filter(
            (m: ChatMessage) => m.senderType !== 'tutor_note',
          ),
        );

        if (notesRes.ok) {
          const notesData = await notesRes.json();
          setNotes(notesData.notes || []);
        }
      } catch {
        setError('Failed to load simulation');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [simulationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNoteCreated = useCallback((note: TutorNoteData) => {
    setNotes((prev) => [note, ...prev]);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedMessageId(null);
  }, []);

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="-m-6 flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-navy-600" />
          <p className="text-sm text-slate-500">Loading simulation...</p>
        </div>
      </div>
    );
  }

  /* ---- Error / Not found ---- */
  if (!simulation) {
    return (
      <div className="-m-6 flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <p className="text-sm text-slate-500 mb-4">
            {error || 'Simulation not found.'}
          </p>
          <Button variant="secondary" onClick={() => router.push('/students')}>
            <ArrowLeft size={14} />
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  /* ---- Loaded ---- */
  return (
    <div className="-m-6 flex flex-col h-[calc(100vh-3.5rem)]">
      <ChatHeader simulation={simulation} />

      {/* Split view: conversation + notes */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* LEFT — Conversation (read-only) */}
        <div className="flex-1 lg:w-[70%] flex flex-col min-h-0 border-r border-slate-200">
          {/* Read-only banner */}
          <div className="flex items-center justify-center gap-1.5 bg-slate-50 border-b border-slate-200 px-4 py-1.5 shrink-0">
            <Eye size={13} className="text-slate-400" />
            <p className="text-xs text-slate-400">Read-only view</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Simulation started marker */}
              <div className="text-center py-2">
                <p className="text-xs text-slate-400">
                  Simulation started{' '}
                  {new Date(simulation.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <div className="flex items-center gap-2 justify-center mt-1">
                  <span className="text-xs text-slate-400">
                    {simulation.subjectArea}
                  </span>
                  <span className="text-slate-300">&middot;</span>
                  <span className="text-xs text-slate-400">
                    Level {simulation.level}
                  </span>
                  <span className="text-slate-300">&middot;</span>
                  <span className="text-xs text-slate-400 capitalize">
                    {simulation.difficultyLevel} difficulty
                  </span>
                </div>
              </div>

              {messages.map((message, index) => {
                const prev = index > 0 ? messages[index - 1] : null;
                const showDate =
                  !prev || !isSameDay(prev.createdAt, message.createdAt);
                const isSelected = selectedMessageId === message._id;

                return (
                  <div key={message._id}>
                    {showDate && <DateSeparator date={message.createdAt} />}
                    <div
                      onClick={() =>
                        setSelectedMessageId(isSelected ? null : message._id)
                      }
                      className={`cursor-pointer rounded-lg transition-colors -mx-2 px-2 py-1 ${
                        isSelected
                          ? 'bg-blue-50 ring-1 ring-blue-200'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <MessageBubble
                        message={message}
                        clientName={simulation.clientPersona.name}
                      />
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* RIGHT — Notes panel */}
        <div className="lg:w-[30%] min-w-[280px] border-t lg:border-t-0 bg-white">
          <NotesPanel
            simulationId={simulationId}
            notes={notes}
            messages={messages}
            selectedMessageId={selectedMessageId}
            onClearSelection={handleClearSelection}
            onNoteCreated={handleNoteCreated}
          />
        </div>
      </div>
    </div>
  );
}
