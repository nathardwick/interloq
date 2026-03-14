'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChat } from '@/hooks/useChat';
import { Button, Spinner } from '@/components/ui';
import {
  ChatHeader,
  MessageBubble,
  ChatInput,
  DateSeparator,
} from '@/components/chat';
import { ArrowLeft, X } from 'lucide-react';

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function SimulationPage() {
  const params = useParams();
  const router = useRouter();
  const simulationId = params.id as string;
  const [userRole, setUserRole] = useState<'student' | 'tutor'>('student');

  const {
    simulation,
    messages,
    isLoading,
    error,
    sendMessage,
    loadSimulation,
    dismissError,
    messagesEndRef,
  } = useChat();

  useEffect(() => {
    loadSimulation(simulationId);

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUserRole(data.user?.role || 'student'))
      .catch(() => {});
  }, [simulationId, loadSimulation]);

  /* ---- Initial loading ---- */
  if (!simulation && isLoading) {
    return (
      <div className="-m-6 flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-navy-600" />
          <p className="text-sm text-slate-500">Loading simulation...</p>
        </div>
      </div>
    );
  }

  /* ---- Not found / load error ---- */
  if (!simulation) {
    return (
      <div className="-m-6 flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <p className="text-sm text-slate-500 mb-4">
            {error || 'Simulation not found.'}
          </p>
          <Button variant="secondary" onClick={() => router.push('/dashboard')}>
            <ArrowLeft size={14} />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  /* ---- Loaded ---- */
  const canSend = userRole === 'student' && simulation.status === 'active';
  const visibleMessages = messages.filter((m) => m.senderType !== 'tutor_note');

  return (
    <div className="-m-6 flex flex-col h-[calc(100vh-3.5rem)]">
      <ChatHeader simulation={simulation} />

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

          {visibleMessages.map((message, index) => {
            const prev = index > 0 ? visibleMessages[index - 1] : null;
            const showDate =
              !prev || !isSameDay(prev.createdAt, message.createdAt);

            return (
              <div key={message._id}>
                {showDate && <DateSeparator date={message.createdAt} />}
                <MessageBubble
                  message={message}
                  clientName={simulation.clientPersona.name}
                />
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={dismissError}
            className="text-red-400 hover:text-red-600 ml-3"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input area */}
      {canSend ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 shrink-0">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={sendMessage} disabled={isLoading} />
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-center shrink-0">
          <p className="text-sm text-slate-500">
            {userRole === 'tutor'
              ? 'Read-only view'
              : simulation.status === 'paused'
                ? 'Simulation paused'
                : 'Simulation completed'}
          </p>
        </div>
      )}
    </div>
  );
}
