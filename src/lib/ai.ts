import Anthropic from '@anthropic-ai/sdk';
import { ISimulation } from '@/lib/models/Simulation';
import { IMessage } from '@/lib/models/Message';
import {
  buildBaseClientPrompt,
  buildDifficultyLayer,
  buildExperienceLayer,
  buildInformationLayers,
  buildPushbackRules,
  SIMULATION_GENERATOR_PROMPT,
} from '@/lib/prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-20250514';

// ---------------------------------------------------------------------------
// 1. Generate a new simulation scenario
// ---------------------------------------------------------------------------

interface GeneratedSimulation {
  organisation: {
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
  client_persona: {
    name: string;
    role: string;
    personality_traits: string[];
    communication_style: string;
    what_they_care_about: string;
    blind_spot: string;
    hidden_context: string;
  };
  information_layers: {
    layer_1_upfront: string[];
    layer_2_on_good_questions: string[];
    layer_3_deep_probing: string[];
    layer_4_unknown_to_client: string[];
  };
}

function extractJSON(text: string): string {
  // Try to find a JSON object in the response if direct parse fails
  const match = text.match(/\{[\s\S]*\}/);
  if (match) return match[0];
  throw new Error('No JSON object found in response');
}

export async function generateSimulation(
  subjectArea: string,
  level: number,
  excludeNames: string[] = [],
): Promise<GeneratedSimulation> {
  let userMessage = `Generate a consultancy simulation scenario.\n\nSubject area: ${subjectArea}\nLevel: ${level}\n\nRespond with JSON only. No preamble, no markdown formatting.`;

  if (excludeNames.length > 0) {
    userMessage += `\n\nDo not use any of these names: ${excludeNames.join(', ')}`;
  }

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    temperature: 0.8,
    system: SIMULATION_GENERATOR_PROMPT,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  const rawText =
    response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    return JSON.parse(rawText) as GeneratedSimulation;
  } catch {
    // Retry: try to extract JSON from surrounding text
    const extracted = extractJSON(rawText);
    return JSON.parse(extracted) as GeneratedSimulation;
  }
}

// ---------------------------------------------------------------------------
// 2. Get a client response to a student message
// ---------------------------------------------------------------------------

function buildConversationHistory(
  messages: IMessage[],
  studentMessage: string,
  conversationSummary?: string,
): Anthropic.MessageParam[] {
  // Filter to student and client_ai messages only (exclude tutor_note)
  const chatMessages = messages.filter(
    (m) => m.senderType === 'student' || m.senderType === 'client_ai',
  );

  const history: Anthropic.MessageParam[] = [];

  // If we have a summary, prepend it as context in the first user turn
  if (conversationSummary) {
    history.push({
      role: 'user',
      content: `[Previous conversation summary for context: ${conversationSummary}]\n\nContinuing the conversation:`,
    });
    history.push({
      role: 'assistant',
      content: 'Understood — I remember our earlier discussion. Let me pick up where we left off.',
    });
  }

  for (const msg of chatMessages) {
    const role: 'user' | 'assistant' =
      msg.senderType === 'student' ? 'user' : 'assistant';
    history.push({ role, content: msg.content });
  }

  // Append the new student message
  history.push({ role: 'user', content: studentMessage });

  return history;
}

export async function getClientResponse(
  simulation: ISimulation,
  messages: IMessage[],
  studentMessage: string,
  experienceTier: 'novice' | 'developing' | 'proficient',
): Promise<string> {
  // Compose the system prompt from individual layers
  const systemPrompt = [
    buildBaseClientPrompt(simulation),
    buildDifficultyLayer(simulation.difficultyLevel),
    buildExperienceLayer(experienceTier),
    buildInformationLayers(simulation),
    buildPushbackRules(),
    // FUTURE: buildTutorOverrides(module.aiOverrides)
    // FUTURE: buildCurriculumContext(module.curriculumContext)
  ].join('\n\n');

  // Summarise older messages if conversation is long
  let conversationSummary: string | undefined;
  const chatMessages = messages.filter(
    (m) => m.senderType === 'student' || m.senderType === 'client_ai',
  );

  if (chatMessages.length > 20) {
    conversationSummary = await summariseConversation(chatMessages);
    // Only send the last 20 messages in full
    const recentMessages = chatMessages.slice(-20);
    const history = buildConversationHistory(
      recentMessages,
      studentMessage,
      conversationSummary,
    );

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      temperature: 0.6,
      system: systemPrompt,
      messages: history,
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  const history = buildConversationHistory(chatMessages, studentMessage);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1000,
    temperature: 0.6,
    system: systemPrompt,
    messages: history,
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

// ---------------------------------------------------------------------------
// 3. Summarise older conversation messages
// ---------------------------------------------------------------------------

export async function summariseConversation(
  messages: IMessage[],
): Promise<string> {
  // Take all messages except the last 20 and summarise them
  const olderMessages = messages.slice(0, -20);

  if (olderMessages.length === 0) return '';

  const transcript = olderMessages
    .map((m) => {
      const speaker = m.senderType === 'student' ? 'Consultant' : 'Client';
      return `${speaker}: ${m.content}`;
    })
    .join('\n\n');

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 800,
    temperature: 0,
    system: `You are summarising a conversation between a business client and a consultant. Produce a concise summary that captures:
- Key facts and information the client has revealed
- Questions the consultant has asked and topics explored
- Any recommendations made and the client's reaction
- The current state of the relationship and discussion

Write in third person. Be factual and concise. Do not add interpretation.`,
    messages: [
      {
        role: 'user',
        content: `Summarise this conversation:\n\n${transcript}`,
      },
    ],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
