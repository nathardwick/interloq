# Interloq — AI Client Simulation Platform for HE
## Claude Code Development Instructions

> **Project Summary:** An AI-powered consultancy simulation where the AI plays a realistic business client with a messy organisational problem. Students engage as consultants — questioning, clarifying, researching, reframing, and recommending. The AI must never become the answer. It creates the challenge. The student does the thinking.

---

## 1. What This Is

Interloq is a **practice environment** for HE students studying business-related subjects (HRM, Leadership, Strategy, etc.) at Levels 5–7. Students tell the system their subject area and level. The AI generates a realistic organisation with a credible, messy problem in that domain — then stays in character as the client throughout.

Think of it as a flight simulator for professional consultancy skills. Students get to rehearse the dialogue, judgement, questioning, and problem-framing they'll need in real engagements — without the risk of throwing them at real employers before they're ready.

### What It Is NOT
- Not an AI tutor
- Not an answer engine
- Not a case study generator
- Not assessment software
- The AI does not teach. It creates a situation that *forces* learning.

---

## 2. Core Pedagogy (Non-Negotiable Behaviours)

The platform is grounded in established educational theory, adapted for simulation-based learning:

### Theoretical Foundation

| Principle | Theory | Application in Interloq |
|-----------|--------|--------------------------|
| **Student constructs understanding** | Constructivist Learning (Piaget/Bransford) | AI never provides answers — students must build their own analysis |
| **Learning happens in the stretch zone** | Vygotsky's ZPD | Problems are calibrated to level (L5/L6/L7) — challenging but achievable |
| **Support without doing the work** | Bruner's Scaffolding | Client reveals info progressively, responds to good questions, pushes back on weak ones |
| **Thinking deepened through questioning** | Socratic Method (Paul & Elder) | Client asks "What do you mean by that?" / "How would that work in practice?" |
| **Reflection on own reasoning** | Metacognitive Prompting (Hogan & Pressley) | Client challenges vague or generic recommendations — forces justification |

### The Flip: Guide → Scaffold → Elaborate (Inverted)

In a tutoring context (e.g., SentraAI), the AI guides the student through learning. Here, the same pedagogical principles apply but the AI's *role* is inverted:

| Phase | Tutor AI (SentraAI) | Client AI (Interloq) |
|-------|---------------------|----------------------|
| **Guide** | Asks clarifying questions to focus student thinking | Presents a messy problem that *requires* the student to ask clarifying questions |
| **Scaffold** | Breaks tasks into steps for the student | Reveals information progressively as the student asks the right questions |
| **Elaborate** | Prompts deeper thinking with "why" questions | Challenges weak recommendations — "That sounds generic. What specifically would you do here?" |

The pedagogy is the same. The delivery mechanism is different. The student is forced into the driving seat.

---

## 3. Architecture Overview (MVP)

### Tech Stack
```
Frontend:  React + Vite + Tailwind CSS
Backend:   Node.js + Express
Database:  MongoDB (or PostgreSQL — developer preference)
AI:        Anthropic Claude API (claude-sonnet-4-20250514)
Auth:      Simple JWT for MVP (SSO later)
Hosting:   Vercel/Railway or similar for MVP
```

### Core Entities
```
Users
├── id
├── institution_id (nullable — for future multi-tenancy, default null)
├── name
├── email
├── role (student | tutor)
├── created_at

Simulations
├── id
├── institution_id (nullable — for future multi-tenancy, default null)
├── student_id
├── tutor_id (nullable — assigned tutor)
├── module_id (nullable — for future tutor-configured modules, default null)
├── subject_area (e.g., "HRM", "Leadership", "Strategy")
├── level (5 | 6 | 7)
├── organisation_profile (JSON — generated org details)
├── client_persona (JSON — personality traits, difficulty level)
├── information_layers (JSON — the 4-layer info structure)
├── difficulty_level (standard | pressured | difficult)
├── status (active | paused | completed | archived)
├── revealed_layers (JSON — tracks what info has been shared so far)
├── exchange_count
├── created_at
├── last_activity

Messages
├── id
├── simulation_id
├── sender_type (student | client_ai | tutor_note)
├── content
├── metadata (JSON — optional: flagged, tutor_visible_only, etc.)
├── created_at

TutorNotes
├── id
├── simulation_id
├── tutor_id
├── content
├── message_id (nullable — can be pinned to a specific message)
├── created_at
```

> **IMPORTANT — Future-Proofing:**
> See FUTURE_ARCHITECTURE.md for the full multi-tenancy and tutor configuration roadmap.
> For now, include `institutionId` and `moduleId` as nullable fields in all schemas.
> Build AI prompts as composable layers (not one monolithic string) so tutor overrides
> can be injected later. Keep simulations self-contained — store all generated data
> on the simulation document itself so it's never dependent on external references.

---

## 4. User Flows

### 4.1 Student Flow

```
1. Student logs in
2. "Start New Simulation" or "Continue Existing"
3. If new:
   a. Select subject area (dropdown: HRM, Leadership, Strategy, etc.)
   b. Select level (5, 6, or 7)
   c. System generates organisation + problem + client persona
   d. Client AI introduces themselves and the situation
4. Student engages in consultancy conversation
   - Asks questions to understand the problem
   - Clarifies scope, stakeholders, constraints
   - Comes back with analysis and recommendations
5. Client AI responds in character throughout
6. Student can pause and return (conversation persists)
7. Student can mark simulation as "complete" when ready
```

### 4.2 Tutor Flow

```
1. Tutor logs in → Dashboard
2. Sees list of assigned students and their simulations
3. Can view any simulation conversation (read-only)
4. Can leave tutor notes (visible only to tutor, not student)
5. Can see:
   - Which students are active
   - How many exchanges per simulation
   - Whether the student is asking good questions or trying to shortcut
6. Cannot intervene in the simulation directly (by design)
```

---

## 5. AI Client Behaviour Specification

This is the most critical part. The AI must behave as a **realistic business client**, not as a tutor, chatbot, or answer engine.

### 5.1 Core Rules (Hardcoded in System Prompt)

1. **Stay in character as the client at all times.** Never break role to explain concepts, teach theory, or offer academic guidance.
2. **Never solve the problem for the student.** If they ask "What do you think we should do?", respond as a real client would: "That's what I'm asking you."
3. **Reveal information progressively.** Don't dump everything upfront. Real clients don't. They answer what's asked — sometimes incompletely, sometimes with their own bias.
4. **Challenge weak thinking.** If recommendations are vague, generic, or textbook-sounding, push back: "That sounds like something from a management book. How would that actually work here?"
5. **Maintain continuity.** Remember everything discussed. Reference earlier conversations. Build a coherent narrative across sessions.
6. **Be human.** Clients have opinions, frustrations, blind spots, preferences. The persona should feel real — not like a neutral information dispenser.

### 5.2 Difficulty Levels

The tutor (or system) can set client difficulty. This is a **manual setting** independent of academic level or experience.

**Standard Client**
- Cooperative, open, answers questions clearly
- Gives reasonable time and space
- Accepts well-reasoned recommendations

**Pressured Client**
- Under time pressure, wants quick answers
- Occasionally impatient: "We've been talking about this for weeks"
- Expects value — "I'm paying for this advice"
- Challenges surface-level thinking

**Difficult Client**
- Guarded, doesn't fully trust external consultants
- May withhold information or contradict themselves
- Has strong opinions — "We tried that before, it didn't work"
- May have political motivations they don't disclose
- Tests professional composure and persistence

### 5.3 Experience Tier (Andragogical Shift)

Independently of difficulty level, the platform tracks how many simulations a student has completed in each subject area and adjusts the client's **professional expectations** accordingly. This happens automatically — no configuration needed.

**Novice (0–2 completed simulations in this subject)**
- Client is patient with basic questions
- May offer a small opening if the student is stuck
- Scaffolding is present but hidden inside the client's behaviour

**Developing (3–5 completed simulations)**
- Client expects the student to drive the conversation
- Won't volunteer information the student should be asking for
- Pushes back on surface-level questions

**Proficient (6+ completed simulations)**
- Client assumes professional competence from the outset
- Mildly impatient with basic or vague questions
- Expects the student to have done preparation before the meeting

The experience tier and difficulty level are **two independent dimensions**. A novice student with a difficult client gets a guarded client who gives them some slack. A proficient student with a standard client gets a cooperative client who still expects professional-grade engagement. Both create meaningful challenge — in different ways.

### 5.4 Problem Generation

When a student starts a simulation, the system generates:

1. **Organisation Profile**
   - Name, sector, size, structure
   - Brief history (2–3 sentences)
   - Current context (growth, decline, restructure, merger, etc.)

2. **The Problem**
   - Must be "wicked" — messy, multi-causal, no single right answer
   - Grounded in the student's subject area
   - Realistic enough that googling won't give a neat solution
   - Has stakeholder tensions, competing priorities, political dynamics

3. **Client Persona**
   - Name, role (e.g., "HR Director", "CEO of a mid-size manufacturing firm")
   - Personality traits (direct, cautious, frustrated, optimistic, etc.)
   - What they care about most
   - What they're not telling you (hidden agenda or blind spot)

4. **Information Layers** (revealed progressively)
   - Layer 1: What the client volunteers upfront
   - Layer 2: What they reveal when asked good questions
   - Layer 3: What only comes out under specific, perceptive questioning
   - Layer 4: What they don't know themselves (student must infer)

---

## 6. System Prompts

### 6.1 Organisation & Problem Generator Prompt

```
See: /prompts/generate_simulation.md
```

### 6.2 Client AI System Prompt

```
See: /prompts/client_system_prompt.md
```

### 6.3 Pushback Detection Prompt

```
See: /prompts/pushback_rules.md
```

---

## 7. MVP Scope

### In Scope (Build This)
- Student auth (simple email/password JWT)
- Tutor auth (same, role-based)
- "New Simulation" flow (subject + level → generated scenario)
- Chat interface (clean, professional — not "edtech-y")
- AI client that stays in character
- Conversation persistence across sessions
- Tutor dashboard (view student simulations, read-only)
- Tutor notes (private annotations on conversations)
- Client difficulty toggle (standard / pressured / difficult)

### Out of Scope (Not MVP)
- Assessment or grading
- Rubrics or scoring
- Group simulations
- File uploads
- Analytics dashboards
- SSO / institutional auth
- Multiple concurrent simulations per student
- Student self-reflection tools
- Peer review
- Mobile app

---

## 8. Development Approach

### Phase 1: Foundation (Week 1–2)
```
- Project scaffolding (React + Vite + Tailwind + Express + MongoDB)
- Auth system (JWT, student/tutor roles)
- Database schema + seed data
- Basic routing and layout
```

### Phase 2: Simulation Engine (Week 2–4)
```
- Organisation/problem generator (Claude API)
- Client system prompt architecture
- Chat interface with streaming responses
- Conversation persistence
- Session continuity (pause/resume)
```

### Phase 3: Client Behaviour (Week 4–6)
```
- Difficulty levels (standard/pressured/difficult)
- Pushback detection and enforcement
- Progressive information revelation
- Persona consistency across sessions
```

### Phase 4: Tutor Visibility (Week 6–8)
```
- Tutor dashboard
- Student simulation list
- Read-only conversation view
- Tutor notes system
- Basic activity indicators
```

### Phase 5: Polish & Test (Week 8–10)
```
- UI refinement
- Prompt tuning based on testing
- Edge case handling
- Error states and loading
- Deploy to staging
```

---

## 9. Key Design Principles

1. **The student interface should feel professional, not academic.** This is simulating a real consultancy interaction. The UI should reflect that — clean, minimal, business-appropriate.

2. **No gamification.** No badges, scores, streaks, or progress bars. This is professional practice, not a game.

3. **The AI must feel like a person.** The simulation fails if the client feels robotic, neutral, or overly helpful. Invest heavily in prompt engineering to make personas feel real.

4. **Continuity matters.** Students must be able to return to a simulation days later and pick up where they left off. The client should remember everything.

5. **Tutor visibility without interference.** Tutors can see everything but cannot change the simulation. Their role is to review how students approach problems, not to steer them.

6. **Messy by design.** Problems should not have clean answers. If a student can solve it in one conversation, the problem isn't complex enough.

---

## 10. File Structure

```
interloq/
├── CLAUDE.md                    # This file
├── prompts/
│   ├── generate_simulation.md   # Org + problem generation prompt
│   ├── client_system_prompt.md  # Main client AI behaviour
│   └── pushback_rules.md       # Rules for challenging weak thinking
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── ChatWindow.jsx
│   │   │   │   ├── MessageBubble.jsx
│   │   │   │   └── ChatInput.jsx
│   │   │   ├── simulation/
│   │   │   │   ├── NewSimulation.jsx
│   │   │   │   └── SimulationList.jsx
│   │   │   ├── tutor/
│   │   │   │   ├── TutorDashboard.jsx
│   │   │   │   ├── StudentList.jsx
│   │   │   │   ├── SimulationViewer.jsx
│   │   │   │   └── TutorNotes.jsx
│   │   │   └── layout/
│   │   │       ├── Header.jsx
│   │   │       └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Simulation.jsx
│   │   │   └── TutorView.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useSimulation.js
│   │   │   └── useChat.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   └── App.jsx
│   └── package.json
├── server/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── simulations.js
│   │   ├── messages.js
│   │   └── tutor.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Simulation.js
│   │   ├── Message.js
│   │   └── TutorNote.js
│   ├── services/
│   │   ├── ai.js               # Claude API integration
│   │   ├── simulation.js       # Org/problem generation logic
│   │   └── pushback.js         # Detects shortcutting behaviour
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roles.js
│   ├── server.js
│   └── package.json
└── README.md
```
