# Interloq — Claude Code Build Guide
## Step-by-Step Prompts & Actions

> **Stack:** Next.js 14 (App Router) + Tailwind CSS + MongoDB + Anthropic Claude API
> **Local:** Docker on port 3003
> **Deploy:** Vercel (eventually)

---

## BEFORE YOU START

### Prerequisites
- Docker Desktop installed and running
- Claude Code installed (`npm install -g @anthropic-ai/claude-code`)
- An Anthropic API key (for Claude Code itself)
- A separate Anthropic API key (for the app's client AI — can be the same key for dev)
- MongoDB Atlas free tier account (or use Docker MongoDB locally)

### Folder Setup
```bash
mkdir interloq
cd interloq
claude
```

This opens Claude Code in the project directory. All prompts below are pasted directly into Claude Code.

---

## PHASE 1: PROJECT SCAFFOLDING

### Step 1.1 — Initialise the Project

**Action:** Paste the CLAUDE.md, all prompt files, and DEVELOPMENT_NOTES.md into the project root before starting. Claude Code will use these as context.

**Claude Code Prompt:**
```
Read CLAUDE.md, DEVELOPMENT_NOTES.md, and all files in /prompts. These are your project instructions.

Initialise a Next.js 14 project using the App Router with:
- TypeScript
- Tailwind CSS
- ESLint
- src/ directory
- App Router (not Pages)

Do NOT use create-next-app interactively — run it with flags to skip prompts.

After initialisation, install these additional dependencies:
- mongoose (MongoDB)
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)
- @anthropic-ai/sdk (Claude API)
- lucide-react (icons)

Create a .env.local file with these placeholder values:
MONGODB_URI=mongodb://mongo:27017/interloq
ANTHROPIC_API_KEY=sk-ant-placeholder
JWT_SECRET=dev-secret-change-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3003

Create a docker-compose.yml that runs:
1. The Next.js app on port 3003 (mapped from container port 3000)
2. A MongoDB container on port 27017 with a persistent volume

Create a Dockerfile for the Next.js app using node:20-alpine with hot reload support (mount the src directory as a volume so changes reflect immediately).

Make sure docker-compose maps port 3003:3000 for the app.

Test that `docker-compose up --build` starts both services without errors.
```

### Step 1.2 — Verify It Works

**Action you do manually:**
```bash
docker-compose up --build
```
Open http://localhost:3003 — you should see the default Next.js page.

**If it fails, paste this into Claude Code:**
```
docker-compose up --build is failing. Here's the error output:
[paste error]

Fix the Docker setup. The app must run on port 3003 locally with hot reload, and MongoDB must be accessible at mongodb://mongo:27017/interloq from within the Docker network.
```

---

## PHASE 2: DATABASE & AUTH

### Step 2.1 — MongoDB Models

**Claude Code Prompt:**
```
Referring to the database schema in CLAUDE.md (Section 3 — Core Entities), create Mongoose models in src/lib/models/ for:

1. User.ts — id, name, email, password (hashed), role (student | tutor), institutionId (nullable, default null — for future multi-tenancy), createdAt
2. Simulation.ts — id, institutionId (nullable, default null), moduleId (nullable, default null — for future tutor modules), studentId, tutorId (nullable), subjectArea, level, organisationProfile (JSON/Mixed), clientPersona (JSON/Mixed), informationLayers (JSON/Mixed), difficultyLevel (standard | pressured | difficult), status (active | paused | completed | archived), revealedLayers (JSON tracking what info has been shared), exchangeCount, createdAt, lastActivity
3. Message.ts — id, simulationId, senderType (student | client_ai | tutor_note), content, metadata (JSON/Mixed), createdAt
4. TutorNote.ts — id, simulationId, tutorId, content, messageId (nullable), createdAt

Also create src/lib/db.ts with a MongoDB connection utility that:
- Uses MONGODB_URI from env
- Caches the connection in development (Next.js hot reload creates multiple connections otherwise)
- Exports a connectDB function

Add proper TypeScript interfaces for all models.
```

### Step 2.2 — Auth System

**Claude Code Prompt:**
```
Create the authentication system. Refer to CLAUDE.md Section 4 for user flows.

1. Create src/lib/auth.ts with:
   - hashPassword / verifyPassword functions using bcryptjs
   - generateToken / verifyToken functions using jsonwebtoken
   - A getCurrentUser helper that reads the JWT from cookies and returns the user

2. Create API routes:
   - src/app/api/auth/register/route.ts — POST: email, password, name, role → creates user, returns JWT in httpOnly cookie. This route is for seeding/dev tooling only — no UI will be built for it. Gate behind ALLOW_REGISTRATION env flag before deployment.
   - src/app/api/auth/login/route.ts — POST: email, password → verifies credentials, returns JWT in httpOnly cookie
   - src/app/api/auth/logout/route.ts — POST: clears the cookie
   - src/app/api/auth/me/route.ts — GET: returns current user from JWT or 401

3. Create a middleware.ts in src/ that:
   - Protects all routes except /login and /register
   - Redirects unauthenticated users to /login
   - Checks JWT from cookies

Keep it simple — no OAuth, no SSO, just email/password with JWT for MVP.
```

### Step 2.3 — Seed Data

**Claude Code Prompt:**
```
Create a seed script at scripts/seed.ts that:

1. Connects to MongoDB
2. Clears existing data
3. Creates test users:
   - Student: email "student@test.com", password "test1234", name "Alex Morgan", role "student"
   - Tutor: email "tutor@test.com", password "test1234", name "Dr Sarah Chen", role "tutor"
4. Assigns the tutor to the student (add a tutorId field or assignedStudents array on the tutor)

Add a script to package.json: "seed": "npx tsx scripts/seed.ts"
Add a note in the README about running the seed.

Also create a docker-compose exec command or npm script that can run the seed inside the Docker container.
```

**Action you do:**
```bash
docker-compose exec app npm run seed
```

---

## PHASE 3: SIMULATION ENGINE

> **IMPORTANT:** This phase is split into focused sub-steps. Complete each one and verify before moving to the next. The composable prompt layer architecture is the most critical design decision in the project — get it right here and everything downstream benefits.

### Step 3.1a — Composable Prompt Layers (prompts.ts)

> **Why this is separate:** This file defines the architecture that supports future tutor configuration (see FUTURE_ARCHITECTURE.md). If this ends up as one monolithic function, future phases require a rewrite. Getting this right now is essential.

**Claude Code Prompt:**
```
Create src/lib/prompts.ts — the composable prompt layer system.

Read prompts/client_system_prompt.md for the client prompt template, and prompts/pushback_rules.md for the pushback rules.

This file must export SEPARATE FUNCTIONS — one per prompt layer. Each function takes specific inputs and returns a string. They will be composed together in ai.ts later.

Create and export these functions:

1. buildBaseClientPrompt(simulation) → string
   - Uses the template from client_system_prompt.md
   - Populates with: client_persona (name, role, personality, communication_style, what_they_care_about, blind_spot, hidden_context), organisation (name, sector, size, structure, history, current_context), problem (summary)
   - Includes the ABSOLUTE RULES section (stay in character, never solve, never offer academic guidance, etc.)
   - Includes the OPENING MESSAGE instruction

2. buildDifficultyLayer(difficultyLevel: 'standard' | 'pressured' | 'difficult') → string
   - Returns the appropriate difficulty behaviour block from client_system_prompt.md
   - Standard: cooperative, open, patient
   - Pressured: time pressure, expects value, challenges surface-level thinking
   - Difficult: guarded, skeptical, tests the consultant

3. buildExperienceLayer(tier: 'novice' | 'developing' | 'proficient') → string
   - Returns a short prompt layer (2-4 sentences each) adjusting client patience:
   
   NOVICE: "The person you're speaking with is relatively new to this kind of consultancy conversation. Be patient with basic questions. If they seem stuck or unsure how to proceed, you can offer a small opening — 'Would it help if I walked you through how things are structured here?' — but only once. Don't hand-hold beyond that."
   
   DEVELOPING: "Expect reasonable competence. Don't volunteer information they should be asking for. If their questions are too surface-level, say so — 'I'd have thought you'd want to dig a bit deeper than that.' You're cooperative but you expect the conversation to go somewhere."
   
   PROFICIENT: "You expect professional-grade engagement from the outset. Don't tolerate vague questions or generic thinking. If they open with something basic, respond with mild impatience — 'I assumed you'd have done your homework before this meeting.' You respect competence and have no time for anything less."

4. buildInformationLayers(simulation) → string
   - Formats the 4-layer information structure from the simulation data
   - Layer 1: what to share upfront
   - Layer 2: what to reveal on good questions
   - Layer 3: what requires deep probing
   - Layer 4: what the client doesn't know (never state directly)

5. buildPushbackRules() → string
   - Returns the pushback rules from pushback_rules.md as a string constant
   - Covers: asking client to solve their own problem, generic recommendations, rushing to solutions, attempting to break character, over-questioning without synthesis, copy-pasting external research

Also export the simulation generator system prompt as a constant:

6. SIMULATION_GENERATOR_PROMPT — the full system prompt from generate_simulation.md, stored as a string constant (not a file read — Vercel can't read files at runtime)

Store all prompts as string constants in this file — not as file reads.

Do NOT create a single buildSystemPrompt function that combines everything. The composition happens in ai.ts. This file only exports individual layers.

VERIFY: The file should export at least 6 named items. If you've written fewer than 5 exported functions, something has been collapsed that shouldn't be.
```

**✅ Check before proceeding:** Look at what CC created. Count the exports. You should see `buildBaseClientPrompt`, `buildDifficultyLayer`, `buildExperienceLayer`, `buildInformationLayers`, `buildPushbackRules`, and `SIMULATION_GENERATOR_PROMPT` as separate exports. If you see one big `buildSystemPrompt` or `getClientPrompt` function, stop and ask CC to refactor into separate layers.

### Step 3.1b — AI Service Layer (ai.ts)

> **Why this is separate:** This file consumes the layers from prompts.ts. By building it second, CC has to import and compose — it can't collapse the layers.

**Claude Code Prompt:**
```
Create src/lib/ai.ts — the AI service layer. This file imports the composable layers from src/lib/prompts.ts and uses the Anthropic SDK.

Build these functions:

1. generateSimulation(subjectArea: string, level: number)
   - Uses the Anthropic SDK
   - Uses the SIMULATION_GENERATOR_PROMPT from prompts.ts as the system prompt
   - Passes subject_area and level as the user message
   - Parses the JSON response
   - Returns the structured simulation data (organisation, problem, client_persona, information_layers)
   - Use claude-sonnet-4-20250514 model, temperature 0.8, max_tokens 3000
   - Include error handling and JSON parse retry logic (try to extract JSON from response if initial parse fails)

2. getClientResponse(simulation: SimulationType, messages: MessageType[], studentMessage: string, experienceTier: 'novice' | 'developing' | 'proficient')
   - Builds the system prompt by COMPOSING the layers from prompts.ts:
   
     const systemPrompt = [
       buildBaseClientPrompt(simulation),
       buildDifficultyLayer(simulation.difficultyLevel),
       buildExperienceLayer(experienceTier),
       buildInformationLayers(simulation),
       buildPushbackRules(),
       // FUTURE: buildTutorOverrides(module.aiOverrides)
       // FUTURE: buildCurriculumContext(module.curriculumContext)
     ].join('\n\n');
   
   - Sends the full conversation history (client messages as role "assistant", student messages as role "user")
   - Appends the new student message
   - Use claude-sonnet-4-20250514 model, temperature 0.6, max_tokens 1000
   - Returns the client's response text

3. summariseConversation(messages: MessageType[]) → string
   - If conversation exceeds 20 messages, summarise older messages
   - Used to keep within context limits for long simulations
   - Summarise messages 1 through (n-20), keep last 20 verbatim
   - Prepend summary as a "Previous conversation summary" block

Import all layer builders from prompts.ts. Do NOT duplicate any prompt text in this file — all prompt content lives in prompts.ts.
```

### Step 3.1c — Experience Tier Query

**Claude Code Prompt:**
```
Add the experience tier helper to src/lib/ai.ts (or create a separate src/lib/experience.ts if you prefer):

getExperienceTier(studentId: string, subjectArea: string): Promise<'novice' | 'developing' | 'proficient'>
   - Counts completed simulations for this student in this subject area
   - 0-2 completed = 'novice'
   - 3-5 completed = 'developing'  
   - 6+ completed = 'proficient'
   - This is a simple MongoDB count query on the Simulation model: { studentId, subjectArea, status: 'completed' }

This function will be called from the messages API route before each client response to determine how patient/demanding the client should be.
```

### Step 3.2a — Simulation CRUD Routes

**Claude Code Prompt:**
```
Create the simulation list and detail API routes. Refer to DEVELOPMENT_NOTES.md for the API route patterns.

1. src/app/api/simulations/route.ts
   - GET: List simulations for current user
     - Students see their own simulations
     - Tutors see simulations from their assigned students
   - POST: Create new simulation — accepts { subjectArea, level, difficultyLevel }
     - Calls generateSimulation() from ai.ts to create the org/problem/persona
     - Saves the simulation to MongoDB with all generated data
     - Generates the client's opening message using getClientResponse with an empty history and the student's experience tier
     - Saves the opening message to the Messages collection with senderType 'client_ai'
     - Returns the simulation with its opening message

2. src/app/api/simulations/[id]/route.ts
   - GET: Get simulation details (with auth check — students can only see their own, tutors can see assigned students')
   - PATCH: Update status (pause, complete, archive)

All routes must check authentication and authorisation using getCurrentUser from auth.ts.
```

### Step 3.2b — Messages Route

**Claude Code Prompt:**
```
Create the messages API route at src/app/api/simulations/[id]/messages/route.ts.

This is the route that powers the chat — every student message goes through here and triggers an AI client response.

- GET: Get all messages for a simulation (ordered by createdAt ascending — oldest first)
  - Auth check: students can only see their own simulation's messages, tutors can see assigned students'

- POST: Send a student message
  1. Verify the user is the student who owns this simulation
  2. Verify the simulation status is 'active'
  3. Save the student message to Messages collection (senderType: 'student')
  4. Look up the student's experience tier: call getExperienceTier(studentId, simulation.subjectArea)
  5. Get all previous messages for this simulation
  6. Call getClientResponse() with the simulation data, full message history, the new student message, AND the experience tier
  7. Save the client's response to Messages collection (senderType: 'client_ai')
  8. Update simulation.lastActivity = now and increment simulation.exchangeCount
  9. Return both the student message and client response

Use streaming (Server-Sent Events) for the client response if straightforward to implement. If streaming adds too much complexity for MVP, a simple request/response returning both messages is fine — we can add streaming later.
```

---

## PHASE 4: STUDENT INTERFACE

### Step 4.1a — Root Layout & Tailwind Config

**Claude Code Prompt:**
```
Set up the root layout and design system. Refer to DEVELOPMENT_NOTES.md UI/UX Guidance section.

Design principles:
- Professional, clean, business-appropriate — NOT "edtech-y"
- Navy/slate colour palette with warm accent for CTAs
- Inter font (or system-ui fallback)
- No gradients, no illustrations, no gamification

1. Update tailwind.config.ts to extend the theme with:
   - Custom 'navy' colour scale (dark blues for primary actions)
   - Use existing Tailwind 'slate' for neutral/secondary
   - A warm accent colour for CTAs (amber or warm orange)

2. Create src/app/layout.tsx — root layout with:
   - Inter font from next/font/google
   - Clean, minimal chrome
   - The Tailwind colour palette applied

3. Create login page at src/app/login/page.tsx:
   - Simple email/password form
   - Professional styling
   - NO registration link — accounts are created via seed/admin only
   - POST to /api/auth/login on submit
   - Redirect to /dashboard on success
   - Show error message on failure
```

### Step 4.1b — App Layout (Header + Sidebar)

**Claude Code Prompt:**
```
Create the authenticated app shell — the layout that wraps all pages after login.

1. Create src/components/layout/Header.tsx:
   - Logo/name "Interloq" top-left (text only, no icon for now)
   - User name + role badge top-right
   - Logout button (calls POST /api/auth/logout then redirects to /login)
   - Clean bottom border

2. Create src/components/layout/Sidebar.tsx:
   - For students: "My Simulations" and "New Simulation" links
   - For tutors: "Students" and "All Simulations" links
   - Active state highlighting based on current route
   - Collapsible on mobile (hamburger toggle)

3. Create the authenticated layout at src/app/(app)/layout.tsx:
   - Wraps all pages inside (app)/ with Header + Sidebar
   - Fetches current user via /api/auth/me to determine role for sidebar
   - If user is not authenticated, redirect to /login

Keep everything server-component friendly where possible, use 'use client' only where interactive behaviour requires it (sidebar toggle, logout button).
```

### Step 4.2 — Dashboard

**Claude Code Prompt:**
```
Create the student dashboard at src/app/(app)/dashboard/page.tsx.

For students, show:
- A greeting with their name
- "Start New Simulation" prominent CTA button
- List of existing simulations as cards showing:
  - Client name + organisation name
  - Subject area + level badge
  - Status badge (active/paused/completed)
  - Last activity relative time ("3 hours ago", "Yesterday")
  - Exchange count ("14 exchanges")
  - Click to continue the simulation

For tutors, show:
- List of assigned students with:
  - Student name
  - Number of active simulations
  - Last activity
  - Click to view their simulations

Keep it clean and minimal. No charts, no analytics, no complex widgets.
This page fetches data server-side where possible.
```

### Step 4.3 — New Simulation Flow

**Claude Code Prompt:**
```
Create the new simulation page at src/app/(app)/simulations/new/page.tsx.

This is a simple form — NOT a wizard or multi-step process:

1. Subject Area dropdown with options:
   - HRM / Human Resource Management
   - Leadership & Management
   - Strategy & Planning
   - Organisational Behaviour
   - Change Management
   - Employee Relations
   - Marketing
   - Operations Management
   - Business Ethics
   - Entrepreneurship & Innovation

2. Level dropdown:
   - Level 5 (Foundation/Second Year)
   - Level 6 (Honours/Final Year)
   - Level 7 (Postgraduate/MBA)

3. Client Difficulty dropdown:
   - Standard (Cooperative, open, patient)
   - Pressured (Under time pressure, expects value)
   - Difficult (Guarded, skeptical, challenging)

4. "Start Simulation" button

On submit:
- Show a loading state: "Setting up your client scenario..." with a subtle spinner
- POST to /api/simulations
- On success, redirect to /simulations/[id] (the chat page)
- On error, show error message

Professional styling, lots of whitespace, clear labels with brief descriptions under each field.
```

### Step 4.4a — Chat Hook (useChat)

> **Why this is separate:** The chat hook manages all the state logic for the conversation. Building it before the page component means the page can focus on layout and rendering rather than tangling state management with UI.

**Claude Code Prompt:**
```
Create src/hooks/useChat.ts — the custom hook that manages all chat state and behaviour.

This hook is used by the simulation chat page. It handles:

1. State:
   - messages: array of all messages in the conversation
   - isLoading: true while waiting for client response
   - error: error message if something fails
   - simulation: the simulation object (org, persona, etc.)

2. Functions:
   - loadSimulation(id: string): fetches simulation details from GET /api/simulations/[id]
   - loadMessages(simulationId: string): fetches message history from GET /api/simulations/[id]/messages
   - sendMessage(content: string): 
     a. Immediately adds the student message to local state (optimistic update)
     b. Sets isLoading = true
     c. POSTs to /api/simulations/[id]/messages with the student's message
     d. On success: adds the client's response to local state, sets isLoading = false
     e. On error: sets error message, sets isLoading = false
     f. Does NOT remove the student's optimistic message on error (they can retry)

3. Behaviour:
   - Auto-scroll to bottom when new messages arrive (expose a scrollRef or callback)
   - Input should be disabled while isLoading is true
   - Error state can be dismissed by the user

Return: { simulation, messages, isLoading, error, sendMessage, loadSimulation, loadMessages, messagesEndRef }

Keep this as a pure React hook — no UI components. The chat page will consume this.
```

### Step 4.4b — Chat Interface Page

> **This is the most important page in the entire application.** Refer to DEVELOPMENT_NOTES.md UI/UX guidance for the chat interface section.

**Claude Code Prompt:**
```
Create the simulation chat page at src/app/(app)/simulations/[id]/page.tsx.

This page uses the useChat hook from the previous step. It is a 'use client' component.

Requirements:

1. HEADER BAR (top of chat area):
   - Client name + role + organisation name (from simulation data)
   - Subject area + level badges
   - Difficulty badge
   - "Simulation started [date]" subtle text
   - Status indicator

2. MESSAGE AREA (scrollable, main body):
   - Client messages: left-aligned, slate/grey background, client avatar initial circle (first letter of client name)
   - Student messages: right-aligned, navy/blue background, white text
   - Messages grouped by day with date separators
   - Timestamps on each message (subtle, below message)
   - Auto-scroll to bottom on new messages (use messagesEndRef from hook)
   - The client's opening message appears first

3. INPUT AREA (fixed bottom):
   - Multiline text input (auto-grows up to 4 lines)
   - Send button (navy, with arrow icon from lucide-react)
   - Disabled while isLoading is true
   - Enter to send, Shift+Enter for new line

4. LOADING/THINKING STATE:
   - When isLoading is true after sending: show a subtle "thinking" indicator on the client side (pulsing dots or a brief "...")
   - Do NOT show a typing indicator — breaks immersion per DEVELOPMENT_NOTES.md
   - When response arrives: replace thinking indicator with the actual message

5. INITIAL LOAD:
   - On mount: call loadSimulation and loadMessages
   - Show skeleton/loading state while fetching
   - Handle 404 (simulation not found)

6. STYLING:
   - Clean, professional chat layout — think Slack DM or a modern CRM conversation view
   - Message bubbles with subtle rounded corners
   - Good spacing between messages
   - Mobile responsive — full width on mobile with input fixed to bottom

Create any sub-components needed (MessageBubble, ChatInput, etc.) in src/components/chat/.
```

---

## PHASE 5: TUTOR INTERFACE

### Step 5.1a — Tutor API Routes

> **Why API routes first:** Building the data layer before the UI ensures the pages have real endpoints to call, and we can test the auth/role checks independently.

**Claude Code Prompt:**
```
Create the tutor-specific API routes. All routes must verify the user's role is "tutor" — return 403 if not.

1. src/app/api/tutor/students/route.ts
   - GET: Return list of students assigned to this tutor
   - For each student, include: name, email, simulation count, last activity timestamp
   - Query: find Users where assignedTutorId matches the tutor's ID

2. src/app/api/tutor/notes/route.ts
   - POST: Create a new tutor note
   - Accepts: { simulationId, content, messageId (optional — for pinning to a specific message) }
   - Verify the tutor has access to this simulation (it belongs to one of their assigned students)
   - Save to TutorNote collection

3. src/app/api/tutor/notes/[simulationId]/route.ts
   - GET: Return all tutor notes for a simulation, ordered newest first
   - Verify the tutor has access to this simulation
```

### Step 5.1b — Tutor Pages (Student List + Student Detail)

**Claude Code Prompt:**
```
Create the tutor student list and detail pages:

1. src/app/(app)/students/page.tsx — List of assigned students
   - Fetches from GET /api/tutor/students
   - Card for each student with: name, email, simulation count, last active
   - Click through to see their simulations
   - Empty state if no students assigned

2. src/app/(app)/students/[studentId]/page.tsx — Student's simulations
   - Breadcrumb: Students > [Student Name]
   - Fetches simulations for this student from GET /api/simulations (filtered by studentId)
   - List of their simulations as cards (same format as student dashboard but read-only)
   - Click through to view a simulation at /simulations/[id]/review
   - Verify the tutor has access to this student
```

### Step 5.1c — Tutor Review View (Read-Only Chat + Notes)

**Claude Code Prompt:**
```
Create the tutor review page at src/app/(app)/simulations/[id]/review/page.tsx.

This is a READ-ONLY view of a student's simulation conversation with a tutor notes panel.

Layout: split view — conversation on the left (70%), tutor notes panel on the right (30%).

LEFT SIDE — Conversation (read-only):
- All messages displayed same as the student chat view (client left, student right)
- NO input area — tutors cannot send messages
- "This is a read-only view" subtle banner at top of the conversation
- Clicking a message highlights it (for pinning notes — see below)

RIGHT SIDE — Tutor Notes Panel:
- "Add Note" text area at top with save button
- If a message is selected/highlighted on the left, the note is pinned to that message
- If no message selected, the note is a general note on the simulation
- List of existing notes below, newest first
- Each note shows: content, timestamp, and which message it's pinned to (if any)
- Notes are PRIVATE — students never see them

Fetches notes from GET /api/tutor/notes/[simulationId]
Saves notes via POST /api/tutor/notes

On mobile: stack vertically — conversation above, notes panel below.
```

---

## PHASE 6: DOCKER & LOCAL TESTING

### Step 6.1 — Verify Full Flow

**Action you do manually — test this sequence:**

```
1. docker-compose up --build
2. Open http://localhost:3003
3. Login as student@test.com / test1234
4. Click "New Simulation"
5. Select HRM, Level 6, Standard difficulty
6. Wait for scenario generation
7. Read the client's opening message — does it feel like a real person?
8. Ask a question: "Can you tell me a bit more about the structure of your team?"
9. Does the client respond in character? Does it reveal Layer 1/2 info naturally?
10. Try: "What do you think the solution is?" — does the client push back?
11. Try: "You should improve your communication strategy" — does it challenge this?
12. Logout
13. Login as tutor@test.com / test1234
14. Can you see the student's simulation?
15. Can you read the conversation?
16. Can you add a tutor note?
17. Can the tutor NOT send messages in the chat?
```

### Step 6.2 — Test Experience Tier (Andragogical Shift)

**Claude Code Prompt:**
```
Update the seed script (scripts/seed.ts) to add a second student for testing the experience tier:

- Student 2: email "experienced@test.com", password "test1234", name "Jordan Webb", role "student"
- Create 6 completed simulations for Jordan in the "HRM" subject area (these can have minimal/mock data — they just need to exist with status "completed" so the experience tier query counts them)
- Assign this student to the same tutor

This lets us test the difference between a novice student (Alex, 0 completed) and a proficient student (Jordan, 6 completed) in the same subject area.
```

**Action you do manually after re-seeding:**
```
1. Login as student@test.com (Alex — novice tier)
2. Start a new HRM simulation
3. Open with a basic question: "Hi, where should I start?"
4. Note the client's tone — should be patient, possibly offering a small opening

5. Logout, login as experienced@test.com (Jordan — proficient tier)
6. Start a new HRM simulation at the same level and difficulty
7. Open with the same basic question: "Hi, where should I start?"
8. Note the client's tone — should be noticeably less patient, more expectant

If both clients respond identically, the experience layer isn't working.
The difference should be subtle but real — not a personality transplant,
just a shift in how much slack the client gives you.
```

### Step 6.3 — Prompt Tuning

**If anything breaks during testing, paste this into Claude Code:**
```
I'm testing the full flow and [describe what's broken]. Here's what I see:
[paste error/screenshot description]

Fix this. The expected behaviour is [describe what should happen].
```

**For prompt tuning specifically:**

**Claude Code Prompt:**
```
I've been testing the client AI and need adjustments. Here's what I'm seeing:

[PASTE SPECIFIC EXAMPLES OF CLIENT RESPONSES THAT AREN'T RIGHT]

Problems to fix:
- [e.g., "Client is too helpful — giving away information without being asked"]
- [e.g., "Client breaks character when student asks meta questions"]
- [e.g., "Responses are too long — real clients don't give speeches"]
- [e.g., "Client doesn't reference earlier conversation points"]

Adjust the system prompt in src/lib/prompts.ts to fix these issues. Show me the specific changes.
```

---

## PHASE 7: POLISH

### Step 7.1a — API Error Handling & Validation

**Claude Code Prompt:**
```
Add consistent error handling to all API routes:

1. Consistent error response format across all routes: { error: string, code: string }
   - e.g., { error: "Simulation not found", code: "NOT_FOUND" }
   - e.g., { error: "You don't have access to this resource", code: "FORBIDDEN" }

2. Input validation on all API routes:
   - Max message length: 2000 characters
   - Required fields check on POST routes
   - Sanitise all user input before storing (strip HTML tags at minimum)

3. Rate limiting on the messages endpoint:
   - Max 10 messages per minute per user
   - Return 429 with { error: "Please wait a moment before sending another message", code: "RATE_LIMITED" }

4. Auth edge cases:
   - Expired JWT → clear cookie, return 401
   - Invalid token → clear cookie, return 401
   - Role mismatch (student accessing tutor route) → return 403
```

### Step 7.1b — Client-Side Error & Loading States

**Claude Code Prompt:**
```
Add user-friendly error and loading states throughout the frontend:

1. AI API failures in chat:
   - If the client response fails, show: "The client seems to have stepped away for a moment. Try again."
   - Show a "Retry" button on the message input area
   - Log the error to console (server-side logging can come later)

2. Empty states:
   - No simulations yet (student dashboard): "You haven't started any simulations yet. Ready to meet your first client?"
   - No students assigned (tutor dashboard): "No students assigned yet."
   - No notes on a simulation (tutor review): "No notes yet. Click a message to pin a note, or add a general observation."

3. Loading states:
   - Skeleton loaders on dashboard while fetching simulations
   - Skeleton on student list while fetching
   - Chat page: skeleton while loading simulation + messages

4. Error pages:
   - 404: simulation not found, student not found — friendly message with link back to dashboard
   - Generic error boundary for unexpected failures
```

### Step 7.2 — Mobile Responsiveness

**Claude Code Prompt:**
```
Make the entire application mobile-responsive:

1. Sidebar collapses to a hamburger menu on mobile
2. Chat interface is full-width on mobile with input fixed to bottom
3. Tutor review page stacks vertically on mobile (conversation above, notes below)
4. All forms are touch-friendly with appropriate input sizes
5. Cards stack vertically on mobile
6. Test at 375px (iPhone SE) and 768px (iPad) widths

Don't add any mobile-only features — just make the existing UI work well on smaller screens.
```

### Step 7.3 — Final UI Polish

**Claude Code Prompt:**
```
Do a final polish pass on the UI:

1. Consistent spacing throughout (use Tailwind's spacing scale consistently)
2. Hover states on all interactive elements
3. Focus styles for accessibility (visible focus rings)
4. Transition/animation on:
   - Sidebar collapse
   - Message appearing in chat
   - Button hover states
   - Page transitions (subtle fade)
5. Proper favicon and page titles (each page should have a descriptive <title>)
6. "Interloq" branding consistent everywhere
7. Ensure colour contrast meets WCAG AA standards
8. Add a simple footer with version number

Keep it professional and understated. No flashy animations.
```

---

## PHASE 8: PRE-DEPLOYMENT PREP

### Step 8.1 — Environment Configuration

**Claude Code Prompt:**
```
Prepare the project for Vercel deployment:

1. Create a .env.example with all required environment variables (no actual values)
2. Update the MongoDB connection to work with both:
   - Local Docker MongoDB (MONGODB_URI=mongodb://mongo:27017/interloq)
   - MongoDB Atlas connection string (for production)
3. Ensure all API routes work as Vercel serverless functions (no long-running processes)
4. Add a vercel.json if needed for any configuration
5. Make sure the Anthropic API calls have appropriate timeouts (30s max for generation, 15s for conversation)
6. Add a health check endpoint at /api/health that returns { status: 'ok', timestamp: Date.now() }
7. Update next.config.js for production optimisation
8. Ensure no hardcoded localhost URLs — everything uses NEXT_PUBLIC_APP_URL or relative paths

Create a DEPLOYMENT.md with:
- Vercel setup instructions
- Required environment variables
- MongoDB Atlas setup steps
- Post-deployment verification checklist
```

---

## TROUBLESHOOTING PROMPTS

### If Docker won't start:
```
docker-compose up --build is failing with this error:
[paste error]
Fix the Docker configuration. The app must run on port 3003 with hot reload and MongoDB accessible within the Docker network.
```

### If MongoDB connection fails:
```
The app can't connect to MongoDB. Error:
[paste error]
The MongoDB container is running (I can see it in docker ps). Fix the connection — the URI should be mongodb://mongo:27017/interloq when running in Docker.
```

### If Claude API returns errors:
```
The Claude API call is failing when I try to generate a simulation. Error:
[paste error]
Check the API integration in src/lib/ai.ts. Make sure the Anthropic SDK is configured correctly with the API key from .env.local.
```

### If auth isn't working:
```
I can't stay logged in — the JWT cookie isn't being set/read properly. When I login I get a success response but then /api/auth/me returns 401.
Debug the auth flow: cookie setting in the login route, cookie reading in the middleware, and the getCurrentUser helper.
```

### If the client AI breaks character:
```
The client AI is breaking character. Here's an example:

Student: "Can you just tell me the answer?"
Client: "[paste the problematic response]"

It should stay in character as the client and redirect — not offer academic guidance or acknowledge being an AI. Fix the system prompt in src/lib/prompts.ts.
```

### If you need to reset everything:
```
I need to start fresh. Please:
1. Drop all MongoDB collections
2. Re-run the seed script
3. Clear any cached state
4. Verify the app starts clean
```

---

## QUICK REFERENCE: What Each File Does

```
interloq/
├── CLAUDE.md                          # Master project spec (give to Claude Code first)
├── DEVELOPMENT_NOTES.md               # UI, prompt engineering, testing, API design
├── FUTURE_ARCHITECTURE.md             # Multi-tenancy, tutor config layer, pricing model
├── DEPLOYMENT.md                      # Vercel deployment guide (created in Phase 8)
├── README.md                          # Project overview
├── docker-compose.yml                 # Local dev environment
├── Dockerfile                         # Next.js container
├── prompts/
│   ├── generate_simulation.md         # Reference: how simulations are generated
│   ├── client_system_prompt.md        # Reference: how the client AI behaves
│   └── pushback_rules.md             # Reference: how shortcutting is handled
├── scripts/
│   └── seed.ts                       # Database seed script
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout
│   │   ├── login/page.tsx            # Login page
│   │   ├── (app)/                    # Authenticated routes
│   │   │   ├── layout.tsx            # App layout (header + sidebar)
│   │   │   ├── dashboard/page.tsx    # Student/tutor dashboard
│   │   │   ├── simulations/
│   │   │   │   ├── new/page.tsx      # New simulation form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Chat interface (student)
│   │   │   │       └── review/page.tsx # Read-only review (tutor)
│   │   │   └── students/
│   │   │       ├── page.tsx          # Student list (tutor)
│   │   │       └── [studentId]/page.tsx # Student detail (tutor)
│   │   └── api/
│   │       ├── auth/                 # Auth endpoints
│   │       ├── simulations/          # Simulation CRUD + messages
│   │       ├── tutor/                # Tutor-specific endpoints
│   │       └── health/route.ts       # Health check
│   ├── components/
│   │   ├── layout/                   # Header, Sidebar
│   │   └── chat/                     # ChatWindow, MessageBubble, ChatInput
│   ├── hooks/
│   │   ├── useAuth.ts               # Auth state management
│   │   └── useChat.ts               # Chat state + message sending
│   ├── lib/
│   │   ├── db.ts                    # MongoDB connection
│   │   ├── auth.ts                  # JWT + password utilities
│   │   ├── ai.ts                    # Claude API integration
│   │   ├── prompts.ts               # System prompt templates (COMPOSABLE LAYERS)
│   │   └── models/                  # Mongoose models
│   └── middleware.ts                 # Route protection
```

---

## ESTIMATED BUILD TIME

| Phase | What | Time |
|-------|------|------|
| 1 | Project scaffolding + Docker | 1-2 hours |
| 2 | Database + Auth | 2-3 hours |
| 3 | Simulation engine + AI (3 sub-steps) | 3-4 hours |
| 4 | Student interface (4 sub-steps) | 4-6 hours |
| 5 | Tutor interface (3 sub-steps) | 3-4 hours |
| 6 | Testing + debugging | 2-4 hours |
| 7 | Polish (3 sub-steps) | 2-3 hours |
| 8 | Deployment prep | 1-2 hours |
| **Total** | | **~18-28 hours** |

With Claude Code doing the heavy lifting, you're looking at roughly 3-5 focused working days spread across a week or two. The prompt tuning in Phase 6 is the bit that'll take the most iteration — getting the client AI to feel genuinely human and stay in character requires testing and tweaking.
