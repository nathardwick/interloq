import { useState, useCallback, useRef, useEffect } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ChatMessage {
  _id: string;
  simulationId: string;
  senderType: 'student' | 'client_ai' | 'tutor_note';
  content: string;
  createdAt: string;
}

export interface SimulationData {
  _id: string;
  subjectArea: string;
  level: 5 | 6 | 7;
  organisationProfile: {
    name: string;
    sector: string;
    size: string;
    structure: string;
    history: string;
    current_context: string;
  };
  problem: {
    summary: string;
    underlying_causes: string[];
    stakeholder_tensions: string[];
    why_its_wicked: string;
  };
  clientPersona: {
    name: string;
    role: string;
    personality_traits: string[];
    communication_style: string;
    what_they_care_about: string;
    blind_spot: string;
    hidden_context: string;
  };
  difficultyLevel: 'standard' | 'pressured' | 'difficult';
  status: 'active' | 'paused' | 'completed' | 'archived';
  exchangeCount: number;
  createdAt: string;
  lastActivity: string;
}

interface UseChatReturn {
  simulation: SimulationData | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  loadSimulation: (id: string) => Promise<void>;
  loadMessages: (simulationId: string) => Promise<void>;
  dismissError: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useChat(): UseChatReturn {
  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null!);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ---- loadSimulation ---- */

  const loadSimulation = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(`/api/simulations/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load simulation');
        return;
      }

      setSimulation(data.simulation);
      setMessages(data.messages || []);
    } catch {
      setError('Failed to load simulation');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ---- loadMessages ---- */

  const loadMessages = useCallback(async (simulationId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(`/api/simulations/${simulationId}/messages`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load messages');
        return;
      }

      setMessages(data.messages || []);
    } catch {
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ---- sendMessage ---- */

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !simulation || isLoading) return;

      setError(null);

      // Optimistic update — add student message immediately
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: ChatMessage = {
        _id: tempId,
        simulationId: simulation._id,
        senderType: 'student',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setIsLoading(true);

      try {
        const res = await fetch(`/api/simulations/${simulation._id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: content.trim() }),
        });

        const data = await res.json();

        if (!res.ok) {
          // Keep the student message so they can see what they sent
          setError(data.error || 'Failed to send message');
          return;
        }

        // Replace optimistic message with real student message, add client response
        setMessages((prev) => [
          ...prev.filter((m) => m._id !== tempId),
          data.studentMessage,
          data.clientMessage,
        ]);
      } catch {
        // Keep the student message — they can retry
        setError('Failed to send message. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [simulation, isLoading],
  );

  /* ---- dismissError ---- */

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  return {
    simulation,
    messages,
    isLoading,
    error,
    sendMessage,
    loadSimulation,
    loadMessages,
    dismissError,
    messagesEndRef,
  };
}
