# Interloq
## AI Client Simulation Platform for Higher Education

A practice environment where AI plays a realistic business client with a messy organisational problem. Students engage as consultants — questioning, clarifying, researching, and recommending. The AI creates the challenge. The student does the thinking.

---

## Project Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | **Primary Claude Code instructions.** Start here. Contains architecture, scope, user flows, development phases, and file structure. |
| `prompts/generate_simulation.md` | Prompt template for generating organisations, problems, and client personas. Includes a full example output for Level 6 HRM. |
| `prompts/client_system_prompt.md` | The system prompt template that controls how the AI client behaves in conversation. This is the heart of the platform. |
| `prompts/pushback_rules.md` | Detection patterns and in-character responses for when students try to shortcut the consultancy process. |
| `DEVELOPMENT_NOTES.md` | UI/UX guidance, prompt engineering notes, testing scenarios, database design, API routes, and future considerations. |

## How to Use These Files

These documents are designed to be fed to **Claude Code** (or any AI-assisted development environment) as project context. The `CLAUDE.md` file is the primary entry point — it contains everything needed to understand what's being built and how to build it.

### Suggested Claude Code Workflow

1. Open `CLAUDE.md` as the primary project instruction file
2. Reference `prompts/` files when building the AI integration layer
3. Reference `DEVELOPMENT_NOTES.md` for UI decisions, testing, and API design
4. Build in phases as outlined in Section 8 of `CLAUDE.md`

## Tech Stack (MVP)

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Auth:** JWT (simple email/password for MVP)

## Pedagogical Foundation

Grounded in constructivist learning theory (Piaget/Bransford), Vygotsky's Zone of Proximal Development, Bruner's scaffolding, Socratic questioning (Paul & Elder), and metacognitive prompting (Hogan & Pressley). The same theoretical base as SentraAI's Conversational Pedagogy Engine — but applied through simulation rather than tutoring.

The core principle: **AI should create conditions for thinking, not replace thinking.**
