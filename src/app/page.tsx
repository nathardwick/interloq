import { Source_Serif_4 } from 'next/font/google';
import { Logo } from '@/components/ui';
import { LoginDropdown } from '@/components/landing/LoginDropdown';
import type { Metadata } from 'next';

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'interloQ | Professional simulation. Powered by AI.',
  description:
    'interloQ creates realistic, challenging practice environments where professionals and students develop real-world skills.',
};

/* Brand name for inline prose. Inherits parent text colour, Q in brand blue. */
function Brand() {
  return (
    <span className="font-sans tracking-tight whitespace-nowrap">
      <span className="font-medium">interlo</span>
      <span className="font-bold" style={{ color: '#1074ef' }}>Q</span>
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className={`${sourceSerif.variable} bg-white`}>
      {/* ---------------------------------------------------------------- */}
      {/*  Header                                                          */}
      {/* ---------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Logo size="lg" />
          <LoginDropdown />
        </div>
      </header>

      <main>
        {/* -------------------------------------------------------------- */}
        {/*  Hero                                                          */}
        {/* -------------------------------------------------------------- */}
        <section className="bg-navy-950 px-6 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
              Different clients. Different problems. Every conversation feels
              real. Every conversation counts.
            </h1>
            <p className="mt-5 font-serif text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl">
              AI-powered professional conversation simulation where the AI is
              the client, and your learners have been hired to help.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <div>
                <a
                  href="#"
                  className="inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium bg-accent-500 text-white hover:bg-accent-600 transition-colors"
                >
                  Consultant Edition
                </a>
                <p className="mt-2 text-xs text-slate-400 text-center sm:text-left">
                  For universities &amp; HE programmes
                </p>
              </div>
              <div>
                <a
                  href="#"
                  className="inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium text-white bg-[#3B8A8C] hover:bg-[#337678] transition-colors"
                >
                  Adviser Edition
                </a>
                <p className="mt-2 text-xs text-slate-400 text-center sm:text-left">
                  For business support &amp; training providers
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/*  What is interloQ?                                             */}
        {/* -------------------------------------------------------------- */}
        <section className="px-6 py-16 lg:py-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-sans text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight border-l-[3px] border-accent-500 pl-4">
              The conversation gap
            </h2>
            <div className="mt-8 space-y-10 font-serif text-base md:text-lg text-slate-700 leading-relaxed">
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-widest mb-3 text-[#1074ef]">
                  The moment that matters
                </p>
                <p>
                  You&apos;ve taught them the theory. They can cite the models,
                  analyse case studies, and write a pretty decent report. But
                  there&apos;s a moment in every professional career where
                  someone sits across from you, describes a problem they
                  can&apos;t solve, and waits for you to say something useful.
                  That moment is hard to teach, because until now, you
                  couldn&apos;t simulate it. Not with role play between
                  classmates. Not with a written case study. Not by observation
                  when everyone knows they&apos;re being observed. Not with
                  anything that scales past a handful of learners per year.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-10">
                <p className="font-sans text-xs font-semibold uppercase tracking-widest mb-3 text-[#1074ef]">
                  Meet Jenny
                </p>
                <p>
                  Here&apos;s what your learners experience. They sit down with
                  an HR Director called Jenny. She tells them her company is
                  losing experienced staff to retirement and can&apos;t recruit
                  fast enough. Sounds straightforward. It isn&apos;t. The pay
                  gap she hasn&apos;t mentioned, the two shift supervisors
                  quietly blocking change, the redundancy plan the MD shared
                  with her but nobody else knows about. None of that comes for
                  free. Your learners have to find it through the kind of
                  questioning that actual professionals do in actual meetings.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-10">
                <p className="font-sans text-xs font-semibold uppercase tracking-widest mb-3 text-[#1074ef]">
                  No two simulations alike
                </p>
                <p>
                  Next time, it won&apos;t be Jenny. It&apos;ll be Marcus, a
                  cafe owner who thinks his problem is marketing but is actually
                  that he&apos;s bleeding cash on a lease he can&apos;t afford.
                  Or Priya, the logistics MD, who won&apos;t admit the real
                  reason three senior staff left in six months. Every simulation
                  generates a unique organisation, a unique client, and a unique
                  problem with no neat answer. Information comes in layers. The
                  surface stuff comes easy. The rest has to be earned. And the
                  client is not there to help. They&apos;re there because they
                  need help. The distinction matters.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-10">
                <p className="font-sans text-xs font-semibold uppercase tracking-widest mb-3 text-[#1074ef]">
                  The client remembers. The platform learns.
                </p>
                <p>
                  Your learners can leave and come back days later. Jenny
                  remembers what they asked, what they missed, and what they
                  said they&apos;d come back to. And the more simulations they
                  complete, the less patience the next client has for basic
                  questions. That isn&apos;t a setting you toggle. The platform
                  tracks how each learner develops and raises expectations
                  accordingly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/*  Two Editions                                                  */}
        {/* -------------------------------------------------------------- */}
        <section className="bg-slate-50 px-6 py-16 lg:py-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Consultant Edition */}
              <div className="rounded-lg border border-slate-200 border-t-[3px] border-t-accent-500 bg-white p-8">
                <h3 className="font-sans text-xl font-semibold text-slate-900">
                  Consultant Edition
                </h3>
                <p className="mt-1 font-sans text-sm font-medium text-accent-600">
                  For Higher Education
                </p>
                <div className="mt-4 space-y-3 font-serif text-base text-slate-700 leading-relaxed">
                  <p>
                    Your students practise consultancy skills with clients
                    facing complex organisational problems. Calibrated to
                    subject area and level, from Level 5 through to Level 7.
                    And you can see every conversation, and add private notes
                    without ever interfering. Last week it was Jenny, insisting
                    nothing was wrong while her best staff walked out the door.
                    This week it might be Priya, who knows exactly what the
                    problem is but won&apos;t tell you until she trusts you.
                    Next week... who knows?
                  </p>
                  <p>
                    Covers HRM, Leadership &amp; Management, Strategy, Change
                    Management, Operations, Marketing, and more.
                  </p>
                </div>
                <a
                  href="#"
                  className="inline-block mt-5 text-sm font-medium text-navy-700 hover:text-accent-600 transition-colors"
                >
                  Learn more →
                </a>
              </div>

              {/* Adviser Edition */}
              <div className="rounded-lg border border-slate-200 border-t-[3px] border-t-[#3B8A8C] bg-white p-8">
                <h3 className="font-sans text-xl font-semibold text-slate-900">
                  Adviser Edition
                </h3>
                <p className="mt-1 font-sans text-sm font-medium text-[#3B8A8C]">
                  For Business Support Professionals
                </p>
                <div className="mt-4 space-y-3 font-serif text-base text-slate-700 leading-relaxed">
                  <p>
                    Your trainee advisers practise with small business owners
                    who need help but aren&apos;t always easy to help.
                    Mapped to national occupational standards. You and your
                    assessors get full oversight of every practice session. Last
                    week it was Marcus, who doesn&apos;t want to close his
                    beloved cafe but can&apos;t work out why it&apos;s losing
                    money. This week it might be Asha, just getting started with
                    her first business and not sure what questions to even ask.
                    Next week... let&apos;s see, shall we?
                  </p>
                  <p>
                    Covers growth planning, start-up support, financial
                    guidance, export readiness, and more.
                  </p>
                </div>
                <a
                  href="#"
                  className="inline-block mt-5 text-sm font-medium text-navy-700 hover:text-accent-600 transition-colors"
                >
                  Learn more →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/*  Why not just use AI?                                          */}
        {/* -------------------------------------------------------------- */}
        <section className="px-6 py-16 lg:py-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-sans text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight border-l-[3px] border-accent-500 pl-4">
              Can&apos;t I just do this with a good AI prompt?
            </h2>
            <p className="mt-6 font-serif text-base md:text-lg text-accent-700 font-medium leading-relaxed">
              <a href="/compare" className="underline hover:text-accent-800 transition-colors">You could try.</a> And you might get a conversation that looks kind
              of similar. But you won&apos;t really get one that develops
              professional skills.
            </p>
            <div className="mt-6 space-y-4 font-serif text-base md:text-lg text-slate-700 leading-relaxed">
              <p>
                Ask any AI to play Jenny on a bad day. It&apos;ll be Jenny for
                about five exchanges before it forgets what she was so cross
                about and starts being helpful again. Ask
                it to withhold information and it&apos;ll try, then fold the
                moment a learner pushes. Ask it what it&apos;s already told
                them. It might remember. Depends how far into the conversation
                they are. Or it might just start making things up. That&apos;s
                not a risk worth taking with your learners&apos; development.
              </p>
              <p>
                <Brand />&apos;s clients don&apos;t break character. They track
                what they&apos;ve revealed and what they&apos;re still holding
                back. They push back when your learners offer textbook advice or
                try to skip straight to a recommendation. They get less patient
                as your learners get more experienced. Try that with a prompt
                and a free ChatGPT account.
              </p>
              <p>
                Then there&apos;s everything around the conversation that you
                need and a prompt can&apos;t give you. You and your tutors can
                watch every exchange, add private annotations, and track
                progress across a whole cohort. Scenarios are calibrated to
                subject area and academic level. Curriculum context will shape
                what gets generated, so the simulation tests the right skills
                without the learner ever knowing. All conversations are stored
                securely within your institution, with audit trails and proper
                data governance. Not sitting on someone else&apos;s servers with
                no oversight.
              </p>
            </div>
            <p className="mt-10 pt-6 border-t border-slate-100 font-sans text-lg md:text-xl text-slate-900 font-semibold leading-relaxed">
              A clever prompt gets you a chatbot pretending to be Jenny.{' '}
              <Brand /> gives you the real Jenny. The real Marcus.
              The real Priya. And every difficult conversation your learners
              need to experience before they face a real one.*
            </p>
            <p className="mt-3 text-sm text-slate-400 font-serif italic">
              *Jenny approves this message.
            </p>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/*  Why interloQ?                                                 */}
        {/* -------------------------------------------------------------- */}
        <section className="bg-slate-50 px-6 py-20 lg:py-28">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-sans text-xl font-semibold text-slate-900 tracking-tight">
              Why <Brand />?
            </h2>
            <p className="mt-4 font-serif text-base md:text-lg text-slate-600 leading-relaxed">
              From the Latin <em>inter</em> (between) and{' '}
              <em>loqu&#299;</em> (to speak). To speak between. The conversation
              between a professional and a client, where the real learning
              happens in the space between the question and the answer.
            </p>
          </div>
        </section>
      </main>

      {/* ---------------------------------------------------------------- */}
      {/*  Footer                                                          */}
      {/* ---------------------------------------------------------------- */}
      <footer className="bg-navy-950 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              © 2026{' '}
              <span className="font-sans tracking-tight whitespace-nowrap">
                <span className="font-medium text-white">interlo</span>
                <span className="font-bold" style={{ color: '#1074ef' }}>Q</span>
              </span>
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Contact
              </a>
              <a
                href="#"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
