# Interloq — Future Architecture
## Tutor Configuration Layer & Multi-Tenancy

> **Context:** The MVP gives tutors read-only visibility of student simulations. This document outlines the next evolution — where tutors become scenario designers and the platform scales to multi-tenant institutional use.

---

## What the MVP Has (Tutor as Observer)

```
Tutor can:
├── See assigned students
├── View their simulation conversations (read-only)
├── Add private notes on conversations
└── See basic activity (exchange count, last active)

Tutor cannot:
├── Configure what scenarios students get
├── Upload curriculum content
├── Fine-tune AI client behaviour
├── Create custom scenario templates
├── Set module-level rules or constraints
└── Control which subject areas are available
```

---

## Phase 2: Tutor as Scenario Designer

### New Entity: Modules

A **Module** sits between the tutor and the simulations. It's essentially a course unit or teaching block that the tutor configures.

```
Institution (future)
└── Tutor
    └── Module (e.g., "HRM Level 6 — Semester 2")
        ├── Module Settings
        │   ├── Subject area(s) allowed
        │   ├── Level locked to (5/6/7)
        │   ├── Difficulty range allowed
        │   ├── Custom AI behaviour notes
        │   └── Curriculum context
        ├── Scenario Templates (optional)
        │   ├── Tutor-uploaded case studies
        │   ├── Pre-configured organisations
        │   ├── Specific problem types
        │   └── Sector/industry constraints
        ├── Enrolled Students
        │   ├── Student A → Simulation 1, Simulation 2
        │   ├── Student B → Simulation 1
        │   └── Student C → (not started)
        └── Module Dashboard
            ├── Cohort overview
            ├── Engagement patterns
            └── Common question themes
```

### New Entity: ScenarioTemplate

Tutors can create reusable scenario templates that constrain what the AI generates.

```typescript
// ScenarioTemplate schema
{
  id: string,
  tutorId: string,
  moduleId: string,
  name: string,                        // "NHS Trust Restructure"
  description: string,                 // Brief for students (optional)
  
  // Constraints on generation
  constraints: {
    sector: string | null,             // Lock to specific sector, e.g., "healthcare"
    orgSize: string | null,            // e.g., "large, 2000+ employees"
    problemDomain: string[],           // e.g., ["change management", "employee relations"]
    mustIncludeThemes: string[],       // e.g., ["union involvement", "redundancy risk"]
    excludeThemes: string[],           // e.g., ["international", "M&A"]
    difficultyLevel: string | null,    // Lock difficulty or let student choose
  },
  
  // Optional: tutor-written scenario (bypasses generation entirely)
  customScenario: {
    organisation: object | null,       // Full org profile written by tutor
    problem: object | null,            // Full problem definition
    clientPersona: object | null,      // Full persona
    informationLayers: object | null,  // Full 4-layer info structure
  } | null,
  
  // AI behaviour overrides
  aiOverrides: {
    behaviourNotes: string | null,     // "Always ask students to justify with theory"
    additionalPushbackRules: string[], // Extra rules for this scenario
    responseStyle: string | null,      // "Keep responses short and blunt"
    maxExchanges: number | null,       // Cap simulation length if needed
  },
  
  createdAt: Date,
  isActive: boolean
}
```

### Tutor Configuration Dashboard (Future UI)

```
Module Settings Page:
├── Module Details
│   ├── Name, description
│   ├── Subject area
│   ├── Level
│   └── Semester/dates
│
├── AI Behaviour
│   ├── Default difficulty level
│   ├── Custom behaviour notes (free text → injected into system prompt)
│   │   e.g., "Always challenge students to link recommendations to theory"
│   │   e.g., "If students mention CIPD standards, the client should be dismissive"
│   ├── Response length preference (concise / normal / detailed)
│   └── Pushback sensitivity (gentle / moderate / aggressive)
│
├── Scenario Management
│   ├── "Use AI-generated scenarios" (default — current MVP behaviour)
│   ├── "Use constrained scenarios" (tutor sets parameters, AI generates within them)
│   ├── "Use custom scenarios" (tutor writes the full case study, AI roleplays it)
│   └── Scenario template library (create, edit, activate/deactivate)
│
├── Curriculum Context (uploaded or pasted)
│   ├── Learning outcomes for this module
│   ├── Key theories/frameworks students should be applying
│   ├── Assessment criteria (for tutor reference, NOT shared with AI client)
│   └── Scheme of work / topic sequence
│
├── Student Management
│   ├── Invite students (email or join code)
│   ├── View enrolled students
│   └── Assign specific scenario templates to students (optional)
│
└── Module Dashboard
    ├── Active simulations count
    ├── Students not yet started
    ├── Average exchanges per simulation
    ├── Most common question themes (AI-extracted)
    ├── Students flagged for low engagement
    └── Export: all conversations as PDF/CSV
```

### How Curriculum Context Feeds the AI

The tutor's curriculum context does NOT make the AI a tutor. It makes the AI a **better client**.

Example: If the module's learning outcomes include "Apply stakeholder analysis to organisational change scenarios", the scenario generator uses this to ensure the generated problem *inherently requires* stakeholder analysis — without ever mentioning it to the student.

```
Curriculum context injection into generation prompt:

"The tutor has specified the following learning outcomes for this module:
${module.curriculumContext.learningOutcomes}

Ensure the generated scenario naturally requires the student to engage 
with these themes in order to produce good recommendations. Do NOT 
reference these learning outcomes in the scenario or client dialogue. 
The scenario should organically demand these skills."
```

Similarly, tutor behaviour notes go into the client system prompt:

```
"Additional behaviour guidance from the tutor:
${module.aiOverrides.behaviourNotes}

Apply these naturally within your role as the client. These are 
not rules to state — they are behaviours to embody."
```

---

## Phase 3: Multi-Tenancy

### New Entity: Institution

```typescript
{
  id: string,
  name: string,                  // "University of Manchester"
  slug: string,                  // "uom" — used for routing/branding
  
  settings: {
    allowedSubjectAreas: string[],
    defaultDifficultyRange: [string, string],
    maxSimulationsPerStudent: number,
    dataRetentionDays: number,
    brandColour: string | null,  // Optional white-labelling
    logoUrl: string | null,
  },
  
  subscription: {
    plan: string,                // "starter" | "professional" | "enterprise"
    maxStudents: number,
    maxTutors: number,
    billingCycle: string,
    expiresAt: Date,
  },
  
  createdAt: Date,
  isActive: boolean
}
```

### Updated User Model

```typescript
{
  id: string,
  institutionId: string,         // NEW — ties user to institution
  name: string,
  email: string,
  password: string,
  role: "student" | "tutor" | "admin",  // NEW role: institutional admin
  createdAt: Date
}
```

### Updated Entity Hierarchy

```
Platform (Interloq)
├── Institution A (University of Manchester)
│   ├── Admin (manages institution settings, tutors, billing)
│   ├── Tutor 1
│   │   ├── Module: "HRM Level 6"
│   │   │   ├── Scenario Templates
│   │   │   ├── Enrolled Students → Simulations
│   │   │   └── Module Dashboard
│   │   └── Module: "Leadership Level 7"
│   │       └── ...
│   ├── Tutor 2
│   │   └── Module: "Change Management Level 5"
│   │       └── ...
│   └── Students (enrolled in modules)
│
├── Institution B (Leeds Beckett University)
│   └── ... (completely isolated data)
│
└── Platform Admin (you/your team)
    ├── Institution management
    ├── Platform-wide analytics
    ├── Billing management
    └── System configuration
```

### Data Isolation

Every query must be scoped by `institutionId`. No cross-institution data leakage.

```typescript
// Every DB query looks like this:
const simulations = await Simulation.find({
  institutionId: currentUser.institutionId,  // Always scoped
  studentId: studentId,
});
```

### Auth Evolution

| MVP | Phase 2 | Phase 3 |
|-----|---------|---------|
| Email/password JWT | Email/password JWT | SSO (Azure AD / Google Workspace) |
| Two roles: student, tutor | Two roles: student, tutor | Three roles: student, tutor, admin |
| No institution concept | No institution concept | Full multi-tenancy |
| Tutor manually assigned | Tutor manages modules | Admin manages tutors + modules |

---

## Phase 4: Institutional Admin Dashboard (Future)

```
Admin Dashboard:
├── Institution Settings
│   ├── Name, branding, logo
│   ├── Allowed subject areas
│   ├── Default AI settings
│   └── Data retention policies
│
├── User Management
│   ├── Manage tutors (invite, activate, deactivate)
│   ├── Manage students (bulk import from CSV/SIS)
│   ├── Role assignments
│   └── SSO configuration
│
├── Module Overview
│   ├── All modules across tutors
│   ├── Active simulation counts
│   ├── Student engagement summary
│   └── Usage trending
│
├── Billing & Usage
│   ├── Current plan + usage against limits
│   ├── AI token consumption (cost tracking)
│   ├── Student seat count
│   └── Invoice history
│
└── Compliance & Data
    ├── Data export (GDPR SAR requests)
    ├── Audit log (who accessed what, when)
    ├── Retention policy management
    └── Anonymisation tools
```

---

## Pricing Model Sketch (For Reference)

```
Starter:        £X per student/year — up to 50 students, 3 tutors
Professional:   £X per student/year — up to 500 students, unlimited tutors
Enterprise:     Custom — unlimited, SSO, dedicated support, SLA

All plans include:
- Unlimited simulations per student
- Full tutor configuration
- Conversation export
- Standard scenario library

Professional adds:
- Custom scenario templates
- Curriculum context upload
- Module-level analytics
- Priority support

Enterprise adds:
- SSO integration
- Custom branding
- API access
- Dedicated success manager
- SLA guarantees
- Data residency options
```

---

## Architecture Decisions for MVP That Support This Future

These are things to get right NOW so you don't have to rebuild later:

### 1. Always Use User IDs, Never Assume Direct Relationships
```typescript
// GOOD — supports future module/institution layer
simulation.studentId = user.id;
simulation.createdBy = user.id;

// BAD — hardcodes a direct tutor-student relationship
simulation.tutorId = tutor.id; // This is fine for MVP but...
```
The MVP's tutorId on simulations works, but in Phase 2 the relationship goes through Modules. Design the tutor query to be easily refactored:

```typescript
// MVP: direct assignment
const students = await User.find({ assignedTutorId: tutorId });

// Phase 2: through modules
const modules = await Module.find({ tutorId: tutorId });
const enrollments = await Enrollment.find({ moduleId: { $in: modules.map(m => m.id) } });
const students = await User.find({ id: { $in: enrollments.map(e => e.studentId) } });
```

### 2. Keep AI Prompts as Composable Layers
```typescript
// GOOD — easy to inject tutor overrides later
const systemPrompt = [
  buildBaseClientPrompt(simulation),
  buildDifficultyLayer(simulation.difficultyLevel),
  // Future: buildTutorOverrides(module.aiOverrides),
  // Future: buildCurriculumContext(module.curriculumContext),
  buildPushbackRules(),
].join('\n\n');

// BAD — one monolithic prompt string
const systemPrompt = `You are ${name}... [everything in one blob]`;
```

### 3. Add institutionId as Nullable from Day 1
```typescript
// In your Mongoose schemas, add now but don't enforce:
institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', default: null },
```
This means Phase 3 multi-tenancy is an additive change (populate the field, add scoping) rather than a migration nightmare.

### 4. Keep the Simulation Entity Self-Contained
The simulation should store everything it needs to reconstruct the client conversation — org profile, persona, information layers, difficulty, revealed state. Don't rely on external references that might change. This means:
- If a tutor later edits a scenario template, existing simulations aren't affected
- Simulations are portable and exportable
- Conversation history is always reconstructable

---

## Pedagogical Framework: Signature Pedagogies & Professional Identity Development

### Why This Matters

The platform is not teaching content. It is developing **professional identity**. The distinction is critical — and it has a name in educational research.

Lee Shulman's concept of **Signature Pedagogies** (2005) describes the characteristic forms of teaching and learning that shape how students in a profession think, perform, and act with integrity. Medical students do clinical rounds. Law students do case method. Architecture students do studio critique. These aren't just teaching methods — they're how a profession reproduces its habits of mind.

Interloq is a **signature pedagogy engine for the people professions**. The simulation doesn't teach HRM theory. It forces students to *practice being an HRM professional* — diagnosing, questioning, reframing, advising, managing ambiguity, handling difficult stakeholders — in a context that feels professionally authentic.

### Shulman's Three Dimensions Mapped to Interloq

Shulman identifies three apprenticeships that signature pedagogies develop simultaneously:

| Dimension | Shulman's Term | What It Means | How Interloq Delivers It |
|-----------|---------------|--------------|---------------------------|
| **Cognitive** | "Thinking like a professional" | Subject knowledge applied to real problems | The wicked problem forces students to apply theory to messy, ambiguous situations — not recite it |
| **Practical** | "Performing like a professional" | The skills and practices of the profession | Questioning, diagnosis, stakeholder management, professional communication, recommendation-building |
| **Ethical/Dispositional** | "Acting with integrity" | Professional values, judgement, responsibility | Difficult clients test composure; hidden agendas test ethical awareness; the student bears responsibility for their advice |

Most university assessment only touches the cognitive dimension — essays, exams, case study analyses. Interloq hits all three simultaneously, because the simulation *is* the practice.

### The Andragogical Shift: From Pedagogy to Professional Autonomy

The balance between structure and autonomy should shift **within** levels as students develop — not be defined by them. A Level 5 student on their first simulation needs more containment. That same Level 5 student on their sixth simulation should be experiencing far less scaffolding and far more professional expectation. The level sets the *ceiling of problem complexity*. The andragogical shift happens through accumulated practice.

This means the platform needs to track **student maturity** independently of academic level:

```
Simulation Experience (tracked per student, per subject area)
├── Novice (simulations 1-2)
│   ├── Client is more patient and forthcoming
│   ├── Pushback is gentle — "Can you tell me more about that?"
│   ├── Client may volunteer a helpful nudge if student is stuck
│   ├── Information layers are slightly more accessible
│   └── Student is learning HOW to consult
│
├── Developing (simulations 3-5)
│   ├── Client expects better questions and clearer thinking
│   ├── Pushback is direct — "What specifically would you do?"
│   ├── No more free nudges — student must drive the conversation
│   ├── Information requires skilled questioning to surface
│   └── Student is practising consulting with decreasing support
│
├── Proficient (simulations 6+)
│   ├── Client assumes professional competence from the start
│   ├── Pushback is challenging — "We tried that. It failed. What else?"
│   ├── Client may be impatient with basic questions they'd expect a consultant to already know
│   ├── Critical information is hidden or contradictory
│   └── Student IS the consultant — full ownership expected
```

This progression happens at **every** level. A Level 5 student reaches "Proficient" through practice at Level 5 complexity. A Level 7 student starts at "Novice" within Level 7 complexity (which is already harder). The two dimensions are independent:

```
                    Problem Complexity (set by Level)
                    ─────────────────────────────────►
                    Level 5          Level 6          Level 7
                    (defined,        (ambiguous,       (wicked,
                    manageable)      political)        systemic)
                    
Professional    │   
Expectation     │   Novice L5       Novice L6         Novice L7
(earned through │   (gentle,        (gentle,          (gentle,
practice)       │   simple problem) complex problem)  wicked problem)
                │   
                │   Developing L5   Developing L6     Developing L7
                │   (direct,        (direct,          (direct,
                │   simple problem) complex problem)  wicked problem)
                │   
                │   Proficient L5   Proficient L6     Proficient L7
                ▼   (demanding,     (demanding,       (demanding,
                    simple problem) complex problem)  wicked problem)
```

A Proficient Level 5 simulation is a straightforward problem with a client who expects professional-grade engagement. A Novice Level 7 simulation is a wickedly complex problem with a client who gives you room to find your feet. Both are valid. Both are challenging in different ways.

### Implementation

Track on the student record (or derive from simulation history):

```typescript
// Derive experience tier from completed simulations
const getExperienceTier = (studentId: string, subjectArea: string): 'novice' | 'developing' | 'proficient' => {
  const completed = await Simulation.countDocuments({
    studentId,
    subjectArea,
    status: 'completed'
  });
  
  if (completed >= 6) return 'proficient';
  if (completed >= 3) return 'developing';
  return 'novice';
};
```

This feeds into the composable prompt layer system as a new layer:

```typescript
const systemPrompt = [
  buildBaseClientPrompt(simulation),
  buildDifficultyLayer(simulation.difficultyLevel),    // Manual override still available
  buildExperienceLayer(experienceTier),                 // NEW — andragogical shift
  buildInformationLayers(simulation),
  buildPushbackRules(),
  // Future: buildTutorOverrides(module.aiOverrides)
].join('\n\n');
```

The difficulty toggle (standard/pressured/difficult) still exists as a **manual override** — tutors or students can set it explicitly. But the andragogical shift happens automatically through practice, underneath that setting. A "standard" difficulty client still becomes less forgiving as the student matures.

### Why This Matters Pedagogically

Linking the shift to levels alone creates a false assumption: that a Level 7 student is automatically a competent professional practitioner. They're not — they're an academically advanced student who may have never practised consultancy-style engagement. Conversely, a Level 5 student who's done ten simulations may have developed stronger professional instincts than a Level 7 student on their first.

The andragogical shift must be **earned through practice**, not **assigned by credential**. This aligns with Knowles' (1984) core principle: adults become self-directed learners through experience, not through being told they're ready.

### Socratic Questioning as Client Voice

The Socratic questioning method (Paul & Elder, 2006) maps directly but must be disguised inside the client's voice. The six question types, reframed:

| Socratic Type | Tutor Version (SentraAI) | Client Version (Interloq) |
|---------------|--------------------------|---------------------------|
| **Clarification** | "What do you mean by that?" | "Sorry — what exactly are you suggesting?" |
| **Assumptions** | "What are you assuming here?" | "You seem to be assuming our people will just go along with that. Why?" |
| **Evidence** | "What evidence supports that?" | "What are you basing that on? Have you seen something similar work?" |
| **Perspectives** | "What's another way to look at this?" | "My Operations Director would completely disagree with you on that. How would you handle him?" |
| **Implications** | "What would happen if...?" | "And if that doesn't work? What's our fallback? What does this cost us?" |
| **Meta-questions** | "Why is that question important?" | "Why are you asking me that? What are you trying to get at?" |

The questioning has the same pedagogical function — deepening thinking — but the student experiences it as a demanding client, not a teaching moment. This is what makes the signature pedagogy authentic: the learning is embedded in the professional interaction, not layered on top of it.

### Subject-Specific Signature Pedagogy Adaptation

While the MVP focuses on business/management consultancy, the signature pedagogy framework is inherently adaptable to other professional disciplines:

| Discipline | Client Role | Problem Type | Professional Skills Rehearsed |
|-----------|------------|-------------|------------------------------|
| **HRM** | HR Director, CEO, line manager | Retention, restructuring, employee relations, culture | Diagnosis, stakeholder management, employment law application, advisory skills |
| **Leadership** | Board member, MD, team leader | Strategy tension, change resistance, team dysfunction | Strategic thinking, influence without authority, systemic analysis |
| **Marketing** | Marketing Director, brand manager, startup founder | Market positioning, campaign failure, brand crisis | Market analysis, consumer insight, creative strategy, budget justification |
| **Operations** | Operations Director, supply chain manager | Process failure, quality issues, capacity constraints | Systems thinking, process analysis, data-driven decision-making |
| **Finance** | CFO, investor, business owner | Cash flow crisis, investment decision, audit finding | Financial analysis, risk communication, stakeholder confidence |
| **Social Work** | Service manager, family member, multi-agency partner | Safeguarding concern, resource constraint, ethical tension | Professional judgement, multi-agency working, ethical reasoning |
| **Healthcare Management** | Clinical director, trust CEO, commissioner | Service redesign, staffing crisis, patient safety | Evidence-based decision-making, clinical-managerial interface, public accountability |

Each adaptation would require discipline-specific scenario generation prompts and pushback rules, but the core engine — wicked problem, progressive revelation, in-character challenge, andragogical shift — remains identical.

### Academic Positioning

For research validation, funding bids, or publication, the platform's pedagogical framework can be positioned as:

> "Interloq implements Shulman's (2005) signature pedagogy framework through AI-mediated professional simulation, combining constructivist learning principles (Piaget; Bransford et al., 2000), Vygotskian scaffolding calibrated to both academic level and accumulated simulation experience (Vygotsky, 1978; Wood, Bruner & Ross, 1976), Socratic questioning reframed as authentic client dialogue (Paul & Elder, 2006), and metacognitive prompting embedded within professional practice (Hogan & Pressley, 1997). The platform operationalises the andragogical shift from dependent to self-directed learning (Knowles, 1984) through progressive reduction of AI scaffolding earned through repeated practice — independent of academic level — recognising that professional autonomy is developed through experience, not conferred by credential. This approach maintains the three dimensions of professional apprenticeship — cognitive, practical, and ethical — that Shulman identifies as characteristic of effective professional education."

That's a paragraph for a journal abstract, not a pitch deck — but it's there when needed.

### References

- Bransford, J.D., Brown, A.L. & Cocking, R.R. (2000) *How People Learn: Brain, Mind, Experience, and School*. National Academy Press.
- Hogan, K. & Pressley, M. (1997) *Scaffolding Student Learning: Instructional Approaches and Issues*. Brookline Books.
- Knowles, M.S. (1984) *Andragogy in Action: Applying Modern Principles of Adult Learning*. Jossey-Bass.
- Paul, R. & Elder, L. (2006) *The Art of Socratic Questioning*. Foundation for Critical Thinking.
- Shulman, L.S. (2005) 'Signature Pedagogies in the Professions', *Daedalus*, 134(3), pp. 52–59.
- Vygotsky, L.S. (1978) *Mind in Society: The Development of Higher Psychological Processes*. Harvard University Press.
- Wood, D., Bruner, J.S. & Ross, G. (1976) 'The Role of Tutoring in Problem Solving', *Journal of Child Psychology and Psychiatry*, 17(2), pp. 89–100.

---

## Summary: What Gets Built When

| Phase | What | Tutor Role | Multi-Tenant |
|-------|------|-----------|-------------|
| **MVP (now)** | Core simulation + chat + tutor notes | Observer | No |
| **Phase 2** | Modules + scenario config + curriculum context | Designer | No |
| **Phase 3** | Institution entity + admin role + SSO | Designer | Yes |
| **Phase 4** | Admin dashboard + billing + compliance | Designer | Yes, with governance |

Each phase is additive — you're not rebuilding, you're extending. The MVP architecture supports all of this if you follow the four decisions above.
