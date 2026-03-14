'use client';

import { Avatar } from '@/components/ui';
import type { ChatMessage } from '@/hooks/useChat';

interface MessageBubbleProps {
  message: ChatMessage;
  clientName: string;
}

export function MessageBubble({ message, clientName }: MessageBubbleProps) {
  const isClient = message.senderType === 'client_ai';
  const time = new Date(message.createdAt).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isClient) {
    return (
      <div className="flex gap-3">
        <div className="shrink-0 pt-1">
          <Avatar name={clientName} size="sm" />
        </div>
        <div className="max-w-[75%]">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 ml-1">{time}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <div className="max-w-[75%]">
        <div className="bg-navy-800 rounded-lg px-4 py-3">
          <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 text-right mr-1">{time}</p>
      </div>
    </div>
  );
}
