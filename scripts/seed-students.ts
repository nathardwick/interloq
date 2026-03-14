import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { User } from '../src/lib/models/User';
import { Simulation } from '../src/lib/models/Simulation';
import { Message } from '../src/lib/models/Message';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interloq';

/* ------------------------------------------------------------------ */
/*  Mock simulation data for Jordan                                    */
/* ------------------------------------------------------------------ */

const completedSimulations = [
  {
    organisationProfile: {
      name: 'Thornfield Engineering',
      sector: 'Manufacturing',
      size: '320 employees across two sites',
      structure: 'Traditional hierarchy with functional departments',
      history: 'Family-founded firm, now second-generation ownership. Grew rapidly in the 2010s through acquisition.',
      current_context: 'Post-pandemic recovery with significant workforce reshaping underway.',
    },
    clientPersona: {
      name: 'Diane Hargreaves',
      role: 'HR Director',
      personality_traits: ['direct', 'pragmatic', 'slightly defensive'],
      communication_style: 'Gets to the point quickly, dislikes jargon',
      what_they_care_about: 'Retaining skilled machinists while cutting costs',
      blind_spot: 'Underestimates how much middle management resents the new performance framework',
      hidden_context: 'The CEO has privately told her redundancies are coming regardless of what consultants recommend',
    },
    problem: {
      summary: 'High turnover among skilled machinists despite above-market pay. New performance management system has created resentment. Union relations deteriorating.',
      underlying_causes: ['Poorly communicated performance criteria', 'Middle managers feel bypassed', 'Legacy of broken promises from previous restructures'],
      stakeholder_tensions: ['Shop floor vs management trust deficit', 'Union pushing back on individual performance metrics', 'Finance demanding headcount reduction'],
      why_its_wicked: 'Fixing retention requires investment that conflicts with cost-cutting mandate. The people best placed to fix culture are the ones most disillusioned.',
    },
    informationLayers: {
      layer_1_upfront: ['Turnover is 23% among machinists', 'New performance system launched six months ago', 'Union has filed two formal grievances'],
      layer_2_on_good_questions: ['Three senior machinists left for a competitor who offered flexible shifts', 'Middle managers were not consulted on the performance framework design'],
      layer_3_deep_probing: ['The CEO wants to automate two production lines within 18 months', 'Previous restructure promised retraining that never materialised'],
      layer_4_unknown_to_client: ['Several team leads are quietly organising a collective grievance'],
    },
    exchangeCount: 12,
    messages: [
      { senderType: 'client_ai', content: "Thanks for coming in. I'll be honest, we're in a bit of a mess with retention on the shop floor. We brought in a new performance management system about six months ago and it's not landed well. Turnover among our skilled machinists is sitting at 23% and the union's getting involved. I need someone to help me figure out what's going wrong." },
      { senderType: 'student', content: "Thank you for the context, Diane. Before we dig into the performance system itself, can you walk me through what prompted the decision to introduce it? What problem was it originally trying to solve?" },
      { senderType: 'client_ai', content: "Fair question. We'd had years of no real structure around performance — it was all very informal, manager's discretion. When we acquired the Redcar site in 2019 we suddenly had two different cultures and no consistent way to assess anyone. The board wanted standardisation. So we brought in a framework — individual KPIs, quarterly reviews, the lot. On paper it made sense." },
      { senderType: 'student', content: "And were the middle managers — the ones actually running those reviews — involved in designing it?" },
      { senderType: 'client_ai', content: "Honestly? Not as much as they should have been. It was driven by HR and an external consultancy. We ran briefing sessions but I wouldn't call it co-design. That's come back to bite us — I can see that now." },
    ],
  },
  {
    organisationProfile: {
      name: 'Bridgewater Academy Trust',
      sector: 'Education (Multi-Academy Trust)',
      size: '1,400 staff across eight schools',
      structure: 'Centralised trust board with local governing bodies at each school',
      history: 'Formed in 2016 from three standalone academies. Expanded to eight schools by 2023.',
      current_context: 'Facing Ofsted scrutiny and staff morale issues following rapid expansion.',
    },
    clientPersona: {
      name: 'Marcus Adeyemi',
      role: 'Chief People Officer',
      personality_traits: ['thoughtful', 'cautious', 'politically aware'],
      communication_style: 'Measured and careful with words, avoids committing too quickly',
      what_they_care_about: 'Staff wellbeing and retention, especially among ECTs',
      blind_spot: 'Doesn\'t see how the trust\'s centralisation agenda is perceived as removing school-level autonomy',
      hidden_context: 'Two headteachers have privately threatened to resign if more autonomy is removed',
    },
    problem: {
      summary: 'Staff burnout and early-career teacher attrition across the trust. Centralised HR policies perceived as disconnected from individual school needs.',
      underlying_causes: ['Rapid expansion without proportionate HR infrastructure', 'One-size-fits-all CPD programme', 'Lack of voice mechanisms for school-level staff'],
      stakeholder_tensions: ['Trust board wants consistency', 'Headteachers want autonomy', 'ECTs feel unsupported', 'Unions flagging workload concerns'],
      why_its_wicked: 'The trust needs consistency to function but consistency is what\'s driving people away. Decentralising HR risks the trust\'s operating model.',
    },
    informationLayers: {
      layer_1_upfront: ['ECT attrition is 34% within two years', 'Wellbeing survey scores dropped 18 points year-on-year', 'Trust has a centralised CPD programme'],
      layer_2_on_good_questions: ['Two schools have informally started running their own induction programmes', 'Exit interviews cite lack of agency as top reason for leaving'],
      layer_3_deep_probing: ['The CEO is considering merging three schools under one headteacher to cut costs', 'The trust\'s rapid expansion was driven by DfE pressure, not organic growth'],
      layer_4_unknown_to_client: ['Several experienced teachers are mentoring ECTs informally but this isn\'t recognised or resourced'],
    },
    exchangeCount: 10,
    messages: [
      { senderType: 'client_ai', content: "Good to meet you. I'm Marcus — I lead the people function across Bridgewater. We've got a problem with keeping our early-career teachers. Thirty-four percent leave within two years, which is well above the sector average. Our wellbeing scores have dropped significantly too. I'm hoping you can help us understand what's driving it." },
      { senderType: 'student', content: "Thanks Marcus. That's a significant attrition rate. Can you tell me about the support structures you currently have in place for ECTs across the trust?" },
      { senderType: 'client_ai', content: "We run a centralised CPD programme — everyone goes through the same pathway. It's well-designed on paper, covers pedagogy, behaviour management, subject knowledge. But I'm hearing feedback that it doesn't feel relevant to everyone. The challenge is that with eight schools, we can't run eight different programmes." },
    ],
  },
  {
    organisationProfile: {
      name: 'Carrick & Laine Solicitors',
      sector: 'Legal Services',
      size: '85 employees, single office in Leeds',
      structure: 'Partnership model with equity and salaried partners, associates, and support staff',
      history: 'Established in 1987. Strong reputation in commercial property and employment law.',
      current_context: 'Senior partner retiring, succession planning underway amid generational tension.',
    },
    clientPersona: {
      name: 'Fiona Castellano',
      role: 'Managing Partner',
      personality_traits: ['sharp', 'impatient', 'results-oriented'],
      communication_style: 'Expects you to keep up. Doesn\'t repeat herself.',
      what_they_care_about: 'The firm surviving the next five years without losing key clients',
      blind_spot: 'Dismisses younger associates\' desire for work-life balance as lack of ambition',
      hidden_context: 'She\'s considering an external merger approach but hasn\'t told the other partners',
    },
    problem: {
      summary: 'Succession crisis as founding partners retire. Younger associates reluctant to buy in to equity partnership. Knowledge transfer isn\'t happening.',
      underlying_causes: ['Partnership buy-in cost prohibitive for younger lawyers', 'No structured knowledge transfer or mentoring', 'Cultural gap between partner and associate generations'],
      stakeholder_tensions: ['Retiring partners want maximum payout', 'Associates want modernised working practices', 'Key clients loyal to individual partners, not the firm'],
      why_its_wicked: 'The financial model requires equity buy-in that associates can\'t afford. Reducing buy-in costs means retiring partners get less. Client relationships walk out the door with individuals.',
    },
    informationLayers: {
      layer_1_upfront: ['Two founding partners retiring in 18 months', 'Three associates have turned down partnership offers', 'Top commercial property client has hinted they\'ll review arrangements'],
      layer_2_on_good_questions: ['Associates cite the firm\'s billing targets as incompatible with family life', 'No formal mentoring or handover process exists'],
      layer_3_deep_probing: ['One associate has already been approached by a rival firm', 'Retiring partners have resisted reducing their equity stake'],
      layer_4_unknown_to_client: ['Support staff morale is very low — they see the firm as rudderless'],
    },
    exchangeCount: 14,
    messages: [
      { senderType: 'client_ai', content: "Right, let's not waste time. I'm Fiona, managing partner here. We've got two founding partners retiring in eighteen months and nobody wants to step up. I've offered partnership to three of our best associates and all three said no. Meanwhile our biggest client is making noises about reviewing the relationship. I need a plan." },
      { senderType: 'student', content: "Understood, Fiona. When the associates declined partnership, what reasons did they give?" },
      { senderType: 'client_ai', content: "The usual. Cost. Lifestyle. One of them actually said she didn't want the responsibility. I mean, what did she think she was training for? The buy-in is £180,000 — that's standard for a firm this size. They can finance it. They just don't want to commit." },
      { senderType: 'student', content: "Can I ask what the billing hour expectations look like for partners versus associates currently?" },
      { senderType: 'client_ai', content: "Partners are expected to bill 1,500 hours and bring in business on top. Associates are at 1,200 billable. It's not unreasonable. We're not a magic circle firm — we're not asking for 2,000 hours. But yes, partnership comes with more. That's the deal." },
    ],
  },
  {
    organisationProfile: {
      name: 'Northgate Housing Association',
      sector: 'Social Housing',
      size: '210 employees managing 6,500 properties',
      structure: 'Functional departments with a small executive team',
      history: 'Formed from a local authority stock transfer in 2004. Expanded through development programme.',
      current_context: 'Under regulatory pressure following a governance review. Major repairs backlog.',
    },
    clientPersona: {
      name: 'Raj Kapoor',
      role: 'Executive Director of People & Culture',
      personality_traits: ['empathetic', 'slightly overwhelmed', 'idealistic'],
      communication_style: 'Warm and open, sometimes rambles when stressed',
      what_they_care_about: 'Frontline staff feeling valued and supported',
      blind_spot: 'Focuses on culture initiatives while structural workforce planning issues go unaddressed',
      hidden_context: 'The board has privately discussed outsourcing the repairs function',
    },
    problem: {
      summary: 'Frontline repairs staff demoralised and overworked. Sickness absence at record levels. Skills gaps in compliance-critical areas. Regulatory pressure mounting.',
      underlying_causes: ['Years of underinvestment in workforce development', 'Repairs backlog creating impossible workloads', 'New building safety regulations requiring skills the workforce doesn\'t have'],
      stakeholder_tensions: ['Board wants cost efficiency', 'Frontline staff want manageable workloads', 'Regulator wants compliance evidence', 'Tenants want responsive repairs'],
      why_its_wicked: 'Can\'t fix the repairs backlog without staff. Can\'t retain staff without fixing workloads. Can\'t invest in training while cutting costs. Regulatory clock is ticking.',
    },
    informationLayers: {
      layer_1_upfront: ['Sickness absence averaging 14 days per employee', 'Repairs backlog of 3,200 outstanding jobs', 'Failed to meet two building safety deadlines'],
      layer_2_on_good_questions: ['Agency spend has tripled in two years', 'Three qualified gas engineers left in the last six months'],
      layer_3_deep_probing: ['A whistleblowing complaint about unsafe working practices was upheld last year', 'The previous HR director left after disagreements about workforce investment'],
      layer_4_unknown_to_client: ['Several experienced tradespeople are doing compliance sign-offs they\'re not qualified for'],
    },
    exchangeCount: 9,
    messages: [
      { senderType: 'client_ai', content: "Hi, thanks for coming to see us. I'm Raj, I head up People and Culture here at Northgate. I'll be honest with you, we're under a lot of pressure at the moment. Our repairs team is really struggling — sickness is through the roof, we've got a massive backlog, and the regulator is asking questions about our building safety compliance. I care a lot about our people and I just feel like we're letting them down." },
      { senderType: 'student', content: "Thanks Raj. It sounds like there are several interconnected issues here. Can we start with the sickness absence — do you have a sense of whether it's concentrated in particular teams or roles?" },
      { senderType: 'client_ai', content: "It's heavily concentrated in the repairs and maintenance team. The rest of the organisation is around seven days average, which is about normal for the sector. But repairs is running at twenty-two days. We've tried wellbeing initiatives — mental health first aiders, an EAP — but it's not shifting the numbers." },
    ],
  },
];

const activeSimulations = [
  {
    organisationProfile: {
      name: 'Velocity Digital',
      sector: 'Digital Marketing Agency',
      size: '45 employees',
      structure: 'Flat structure with project-based teams',
      history: 'Founded in 2018 by two former agency creatives. Grew fast through word of mouth.',
      current_context: 'Rapid growth exposing lack of HR infrastructure. First formal HR hire made three months ago.',
    },
    clientPersona: {
      name: 'Leah Osman',
      role: 'Co-Founder & CEO',
      personality_traits: ['energetic', 'informal', 'conflict-averse'],
      communication_style: 'Casual and friendly, avoids difficult conversations',
      what_they_care_about: 'Keeping the creative culture alive as the company scales',
      blind_spot: 'Thinks culture is about perks and vibes rather than management practice',
      hidden_context: 'Her co-founder wants to sell within two years and she hasn\'t processed what that means for the team',
    },
    problem: {
      summary: 'Growing pains in a fast-scaling agency. No performance framework, informal promotion decisions causing resentment, two discrimination complaints in six months.',
      underlying_causes: ['No HR policies or processes until recently', 'Promotions based on founder relationships', 'Diversity issues masked by casual culture'],
      stakeholder_tensions: ['Founders want to preserve startup feel', 'Longer-serving staff expect recognition', 'Newer hires expect professional HR', 'Two complainants want action'],
      why_its_wicked: 'Formalising processes feels like killing the culture. Not formalising is creating legal exposure and inequity.',
    },
    informationLayers: {
      layer_1_upfront: ['Two informal discrimination complaints received', 'No performance review process exists', 'Five promotions in the last year — all decided by the founders over coffee'],
      layer_2_on_good_questions: ['Both complaints relate to the same team lead', 'The new HR manager has already flagged significant legal risks'],
      layer_3_deep_probing: ['The co-founder privately disagrees about the need for formal processes', 'One complainant is considering a tribunal claim'],
      layer_4_unknown_to_client: ['Several junior staff have started job searching quietly'],
    },
    exchangeCount: 4,
    messages: [
      { senderType: 'client_ai', content: "Hey! Thanks for meeting with me. I'm Leah — I co-founded Velocity about seven years ago and honestly things have been amazing, but we're hitting some growing pains. We've just hired our first HR person and she's telling me we need to get a lot more formal about things. And we've had a couple of complaints that have shaken me up a bit. I just want to make sure we handle this right without losing what makes us special." },
      { senderType: 'student', content: "Hi Leah. I appreciate you being open about this. Can you tell me more about the complaints — what are they about and how have they been handled so far?" },
      { senderType: 'client_ai', content: "So two people — separately — have raised concerns about one of our team leads. It's about how he allocates work and makes comments. I don't want to say too much but it's around race. We haven't had a formal process for this kind of thing so right now it's just... me knowing about it and not really knowing what to do. Our HR person says we need to investigate properly." },
    ],
  },
  {
    organisationProfile: {
      name: 'GreenTech Solutions UK',
      sector: 'Renewable Energy',
      size: '160 employees across three regional offices',
      structure: 'Matrix structure with regional managers and functional leads',
      history: 'Started as a solar installation company in 2012. Expanded into wind and battery storage.',
      current_context: 'Won a major government contract requiring rapid scaling of the workforce.',
    },
    clientPersona: {
      name: 'Niamh O\'Brien',
      role: 'Head of People',
      personality_traits: ['organised', 'slightly anxious', 'detail-oriented'],
      communication_style: 'Structured and thorough, likes to cover all bases',
      what_they_care_about: 'Building proper workforce planning before the contract deadline',
      blind_spot: 'Over-focuses on process and structure, underestimates the cultural integration challenge',
      hidden_context: 'The CEO has already committed to delivery timelines she thinks are unrealistic',
    },
    problem: {
      summary: 'Need to hire 60 specialist engineers in six months for a government contract. Current recruitment processes not fit for purpose. Regional offices have different cultures and onboarding practices.',
      underlying_causes: ['No employer brand in a competitive talent market', 'Inconsistent onboarding means high early attrition', 'Regional offices operate as silos'],
      stakeholder_tensions: ['CEO wants speed', 'Finance wants cost control', 'Regional managers want autonomy over hiring', 'Engineering leads want quality over quantity'],
      why_its_wicked: 'Hiring fast enough risks quality. Hiring carefully risks missing deadlines. Regional autonomy creates inconsistency but centralising creates resistance.',
    },
    informationLayers: {
      layer_1_upfront: ['Government contract requires 60 additional engineers by Q3', 'Current time-to-hire is 47 days', 'Early attrition (within 6 months) is 28%'],
      layer_2_on_good_questions: ['Regional managers have informally blocked candidates they didn\'t choose themselves', 'The company has no structured onboarding beyond day-one admin'],
      layer_3_deep_probing: ['A competitor has started targeting GreenTech staff with counter-offers', 'Two regional managers are barely on speaking terms after a project dispute'],
      layer_4_unknown_to_client: ['Engineering teams have already identified the contract timelines as undeliverable at current capacity'],
    },
    exchangeCount: 2,
    messages: [
      { senderType: 'client_ai', content: "Hello, I'm Niamh, Head of People at GreenTech Solutions. Thanks for making time to see us. We've just won a significant government contract for battery storage installations across the Midlands and North, which is brilliant news, but it means we need to hire sixty specialist engineers within six months. Our current recruitment is nowhere near equipped for that kind of volume. I've put together a brief outlining where we are but I'd really value an external perspective on how to approach this." },
      { senderType: 'student', content: "Thanks Niamh. That's a significant scaling challenge. Before we discuss recruitment strategy, can you give me a sense of your current workforce composition and where the biggest gaps are?" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Main seed function                                                 */
/* ------------------------------------------------------------------ */

async function seedStudents() {
  console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.\n');

  // Find the existing tutor
  const tutor = await User.findOne({ email: 'tutor@test.com' });
  if (!tutor) {
    console.error('Tutor (tutor@test.com) not found. Run "npm run seed" first.');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`Found tutor: ${tutor.name} (${tutor._id})\n`);

  const hashedPassword = await bcrypt.hash('test1234', 12);

  // ---- Student 1: Jordan Webb (with simulations) ----
  const jordan = await findOrCreateUser({
    name: 'Jordan Webb',
    email: 'jordan@test.com',
    password: hashedPassword,
    role: 'student',
    assignedTutorId: tutor._id,
  });

  if (jordan.created) {
    console.log('  Creating simulations for Jordan...');

    // Completed simulations
    for (let i = 0; i < completedSimulations.length; i++) {
      const simData = completedSimulations[i];
      const createdAt = new Date(Date.now() - (30 - i * 5) * 24 * 60 * 60 * 1000);

      const sim = await Simulation.create({
        studentId: jordan.user._id,
        tutorId: tutor._id,
        subjectArea: 'HRM',
        level: 6,
        organisationProfile: simData.organisationProfile,
        clientPersona: simData.clientPersona,
        problem: simData.problem,
        informationLayers: simData.informationLayers,
        difficultyLevel: 'standard',
        status: 'completed',
        exchangeCount: simData.exchangeCount,
        createdAt,
        lastActivity: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
      });

      const messages = simData.messages.map((msg, idx) => ({
        simulationId: sim._id,
        senderType: msg.senderType,
        content: msg.content,
        createdAt: new Date(createdAt.getTime() + idx * 3 * 60 * 1000),
      }));

      await Message.insertMany(messages);
      console.log(`    Completed: ${simData.clientPersona.name} — ${simData.organisationProfile.name} (${messages.length} messages)`);
    }

    // Active simulations
    for (let i = 0; i < activeSimulations.length; i++) {
      const simData = activeSimulations[i];
      const createdAt = new Date(Date.now() - (5 - i * 2) * 24 * 60 * 60 * 1000);

      const sim = await Simulation.create({
        studentId: jordan.user._id,
        tutorId: tutor._id,
        subjectArea: 'HRM',
        level: 6,
        organisationProfile: simData.organisationProfile,
        clientPersona: simData.clientPersona,
        problem: simData.problem,
        informationLayers: simData.informationLayers,
        difficultyLevel: 'standard',
        status: 'active',
        exchangeCount: simData.exchangeCount,
        createdAt,
        lastActivity: new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000),
      });

      const messages = simData.messages.map((msg, idx) => ({
        simulationId: sim._id,
        senderType: msg.senderType,
        content: msg.content,
        createdAt: new Date(createdAt.getTime() + idx * 3 * 60 * 1000),
      }));

      await Message.insertMany(messages);
      console.log(`    Active: ${simData.clientPersona.name} — ${simData.organisationProfile.name} (${messages.length} messages)`);
    }

    console.log(`  6 simulations created for Jordan.\n`);
  }

  // ---- Student 2: Priya Sharma (no simulations) ----
  await findOrCreateUser({
    name: 'Priya Sharma',
    email: 'priya@test.com',
    password: hashedPassword,
    role: 'student',
    assignedTutorId: tutor._id,
  });

  // ---- Student 3: Tom Okonkwo (no simulations) ----
  await findOrCreateUser({
    name: 'Tom Okonkwo',
    email: 'tom@test.com',
    password: hashedPassword,
    role: 'student',
    assignedTutorId: tutor._id,
  });

  console.log('Seed complete.');
  console.log('---');
  console.log('Test credentials (all passwords: test1234):');
  console.log('  jordan@test.com — 4 completed + 2 active HRM simulations');
  console.log('  priya@test.com  — clean account');
  console.log('  tom@test.com    — clean account');

  await mongoose.disconnect();
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

async function findOrCreateUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  assignedTutorId: mongoose.Types.ObjectId;
}): Promise<{ user: any; created: boolean }> {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    console.log(`Skipping ${data.email} — already exists (${existing._id})`);
    return { user: existing, created: false };
  }

  const user = await User.create(data);
  console.log(`Created ${data.role}: ${data.name} — ${data.email} (${user._id})`);
  return { user, created: true };
}

seedStudents().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
