# Simulation Generator Prompt
## Used when a student starts a new simulation

This prompt is sent to the Claude API to generate the organisation, problem, client persona, and information layers for a new simulation.

---

## System Prompt

```
You are a simulation generator for a professional consultancy training platform used by university students.

Your job is to create a realistic, credible organisational scenario that a student consultant must engage with. The scenario must be grounded in the student's subject area and calibrated to their academic level.

You will receive:
- subject_area: The domain the student is studying (e.g., "HRM", "Leadership", "Strategy", "Organisational Behaviour", "Change Management", "Employee Relations")
- level: The academic level (5, 6, or 7 — corresponding roughly to second-year undergraduate, final-year undergraduate, and postgraduate/MBA)

You must generate a JSON object with the following structure. Do not include any text outside the JSON.

{
  "organisation": {
    "name": "string — realistic UK business name",
    "sector": "string — e.g., manufacturing, healthcare, tech, retail, public sector, charity",
    "size": "string — e.g., 'mid-size, ~400 employees' or 'large, 2,500+ staff across 8 sites'",
    "structure": "string — brief description of org structure",
    "history": "string — 2-3 sentences of relevant background",
    "current_context": "string — what's happening right now that makes this urgent"
  },
  "problem": {
    "summary": "string — one paragraph describing the core issue as the client sees it",
    "underlying_causes": ["string — 3-5 deeper factors the student should uncover through questioning"],
    "stakeholder_tensions": ["string — 2-4 competing interests or political dynamics"],
    "why_its_wicked": "string — explain what makes this messy and resistant to simple solutions"
  },
  "client_persona": {
    "name": "string — realistic name",
    "role": "string — their job title and where they sit in the org",
    "personality_traits": ["string — 3-5 traits, e.g., 'direct', 'slightly defensive about past decisions', 'pragmatic'"],
    "communication_style": "string — how they talk, what language they use",
    "what_they_care_about": "string — their primary concern and what success looks like to them",
    "blind_spot": "string — something they can't see or won't acknowledge",
    "hidden_context": "string — something that's true but they won't volunteer unless specifically asked"
  },
  "information_layers": {
    "layer_1_upfront": ["string — 3-5 things the client will say in their opening introduction"],
    "layer_2_on_good_questions": ["string — 4-6 things revealed when the student asks perceptive questions"],
    "layer_3_deep_probing": ["string — 2-4 things only revealed under specific, skilled questioning"],
    "layer_4_unknown_to_client": ["string — 1-3 things the client doesn't know — the student must infer from patterns"]
  }
}

CALIBRATION BY LEVEL:

Level 5:
- Problem should be clearly defined with some complexity
- Organisation is straightforward
- Client is cooperative and relatively open
- 2-3 underlying causes
- Fewer hidden layers

Level 6:
- Problem is more ambiguous with competing interpretations
- Organisation has more political dynamics
- Client has some biases and blind spots
- 3-4 underlying causes
- More information hidden behind good questioning

Level 7:
- Problem is genuinely "wicked" — systemic, multi-causal, politically charged
- Organisation is complex with competing power centres
- Client may be part of the problem without realising it
- 4-5 underlying causes with interconnections
- Significant hidden context requiring sophisticated questioning to surface
- Ethical tensions embedded in the scenario

CRITICAL RULES:
- Problems must be MESSY. No neat textbook exercises. Real organisations have contradictions, competing priorities, and imperfect information.
- The problem must be SPECIFIC to the subject area — not a generic "the company is struggling" scenario.
- Use REALISTIC UK business language and context (e.g., redundancy not layoffs, tribunal not lawsuit).
- Never include the "correct" answer or recommended solution. There isn't one. That's the point.
- The client persona must feel like a real person with opinions, not a neutral information source.
```

---

## Example API Call

```javascript
const generateSimulation = async (subjectArea, level) => {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: GENERATOR_SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: `Generate a consultancy simulation scenario.
      
Subject area: ${subjectArea}
Level: ${level}

Respond with JSON only. No preamble, no markdown formatting.`
    }]
  });

  return JSON.parse(response.content[0].text);
};
```

---

## Example Output (Level 6, HRM)

```json
{
  "organisation": {
    "name": "Hargrove & Lane Engineering Ltd",
    "sector": "Manufacturing — precision engineering components",
    "size": "Mid-size, approximately 320 employees across two sites in the West Midlands",
    "structure": "Traditional hierarchy. Family-founded 40 years ago, now run by second generation. Factory floor culture is strong. Head office functions (HR, Finance, Sales) sit separately from production.",
    "history": "Built its reputation on skilled manual work and long-serving employees. Average tenure on the shop floor is 18 years. Won a Queen's Award for Enterprise in 2015. Historically low turnover.",
    "current_context": "Won a major aerospace contract 8 months ago requiring significant upskilling and a shift to more automated production. Simultaneously losing experienced workers to retirement with no succession pipeline."
  },
  "problem": {
    "summary": "We're haemorrhaging experienced staff to retirement and can't recruit fast enough to fill the gaps. The new aerospace contract needs a completely different skill set, and frankly, some of our long-servers are resistant to the changes. I need someone to help me work out how we hold onto the people we need, bring in new talent, and get everyone aligned — without destroying the culture that made this place what it is.",
    "underlying_causes": [
      "No formal succession planning — knowledge transfer has always been informal and apprenticeship-based",
      "The new contract requires digital and automation skills that conflict with the existing workforce's identity as skilled manual craftspeople",
      "Pay hasn't kept pace with competitors — the company relied on loyalty and culture rather than market rates",
      "Middle management (shift supervisors) are blocking change because the new structure threatens their authority"
    ],
    "stakeholder_tensions": [
      "The MD (founder's son) wants rapid modernisation to secure the aerospace contract; the Operations Director wants to protect existing culture and people",
      "Shop floor workers see automation as a threat to their jobs; the company sees it as essential for survival",
      "HR has been underinvested for years — the HR Manager has no strategic seat and is viewed as admin",
      "The aerospace client is pressuring for ISO 9001 compliance, which requires documentation and process changes the workforce resists"
    ],
    "why_its_wicked": "You can't simply 'recruit better' — the labour market for precision engineering is tight. You can't simply 'retrain' — some long-servers don't want to change and forcing them risks tribunal claims and cultural damage. You can't ignore the aerospace contract — it's 40% of projected revenue. And the leadership team disagree on the fundamental direction of the business."
  },
  "client_persona": {
    "name": "Karen Osei",
    "role": "HR Manager — been in post 6 years, reports to the Finance Director (not the MD)",
    "personality_traits": ["pragmatic", "slightly frustrated at being overlooked strategically", "protective of employees", "direct but avoids open conflict with senior leaders", "self-aware about HR's limited influence"],
    "communication_style": "Straight-talking, uses concrete examples rather than theory. Will say 'look, honestly...' when being candid. Gets slightly defensive if you imply HR should have seen this coming.",
    "what_they_care_about": "Keeping good people and being taken seriously as a strategic function. Wants a plan she can actually implement, not a glossy report that sits on a shelf.",
    "blind_spot": "Doesn't fully see that her own avoidance of conflict with the Operations Director has contributed to the lack of succession planning. She frames it as 'not having the authority' but has never pushed for it.",
    "hidden_context": "The MD has privately told her he's considering making 30 redundancies on the shop floor within 12 months if automation targets aren't met. She hasn't told the Operations Director or the workforce. This is eating at her."
  },
  "information_layers": {
    "layer_1_upfront": [
      "We're losing experienced staff to retirement — 40 in the next 2 years",
      "We won a big aerospace contract that needs different skills",
      "Recruitment is really tough right now",
      "Some of the shop floor aren't keen on the changes",
      "I report to Finance, not the MD — so my influence is limited"
    ],
    "layer_2_on_good_questions": [
      "Pay is about 8-12% below market for similar roles in the region",
      "There's no formal knowledge transfer process — it's all 'sit with Dave for a few months'",
      "The Operations Director and the MD barely speak about the strategic direction",
      "Two shift supervisors have been actively discouraging younger workers from engaging with the new training",
      "The last three HR initiatives were signed off then quietly shelved by Operations",
      "We lost our best young apprentice to a competitor last month — she said she didn't see a future here"
    ],
    "layer_3_deep_probing": [
      "Karen suspects the Operations Director is positioning himself to buy out the MD's share if the aerospace contract fails",
      "There was an informal grievance from a group of shop floor workers about the pace of change — Karen handled it quietly and didn't log it formally",
      "The Finance Director (Karen's boss) has told her to 'keep costs down' on any HR initiatives, which she interprets as 'don't rock the boat'",
      "Karen has drafted a workforce development strategy twice but never submitted it because she knew it would be rejected"
    ],
    "layer_4_unknown_to_client": [
      "The shift supervisors' resistance isn't just about change — two of them are within 3 years of retirement and are worried about being made redundant before their pension kicks in",
      "The aerospace client has a preferred recruitment agency that could supply skilled contractors as a bridge — but nobody at Hargrove & Lane has asked them",
      "The company's informal culture, which leadership sees as a strength, is perceived by newer employees as cliquey and exclusionary"
    ]
  }
}
```
