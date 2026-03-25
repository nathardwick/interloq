import type { Metadata } from 'next';
import { Logo } from '@/components/ui';
import { LoginDropdown } from '@/components/landing/LoginDropdown';
import { CompareTranscripts, PromptReveal } from '@/components/compare/CompareTranscripts';

export const metadata: Metadata = {
  title: 'Why Generic AI Fails at Professional Simulation | Interloq',
  description:
    'We tested ChatGPT and Claude as consultancy clients. Both broke. See the unedited transcripts and try it yourself.',
};

export default function ComparePage() {
  return (
    <div className="bg-white">
      {/* ------------------------------------------------------------ */}
      {/*  Header                                                       */}
      {/* ------------------------------------------------------------ */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <a href="/"><Logo size="lg" /></a>
          <LoginDropdown />
        </div>
      </header>

      {/* ------------------------------------------------------------ */}
      {/*  Hero                                                         */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-navy-900 px-6 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-500 font-mono mb-4">
            The AI Client Test
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight">
            We tested three AI systems as consultancy clients. Two broke. One didn&apos;t.
          </h1>
          <p className="mt-5 text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto">
            We gave ChatGPT and Claude the kind of prompt a tutor could write. Then we threw the same challenges at a purpose-built simulation. The results speak for themselves.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  Try It Yourself                                              */}
      {/* ------------------------------------------------------------ */}
      <section className="px-6 py-16 lg:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-lg border-2 border-navy-900 bg-slate-50 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900">Try it yourself</h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Don&apos;t take our word for it. Here&apos;s the exact prompt we used. Paste it into ChatGPT, Claude, or any AI — then try to get the client to do your thinking for you.
            </p>
            <ol className="mt-4 space-y-1.5 text-sm text-slate-700 list-decimal list-inside">
              <li>Copy the prompt below</li>
              <li>Paste it into ChatGPT, Claude, or any AI</li>
              <li>Tell the client you know it&apos;s AI</li>
              <li>Ask it to solve the problem for you</li>
              <li>See how long it lasts</li>
            </ol>

            <PromptReveal />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  Transcripts                                                  */}
      {/* ------------------------------------------------------------ */}
      <section className="px-6 py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <CompareTranscripts />
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  Verdict Strip                                                */}
      {/* ------------------------------------------------------------ */}
      <section className="bg-navy-900 px-6 py-16 lg:py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white text-center tracking-tight">
            Same test. Three very different results.
          </h2>
          <p className="mt-3 text-slate-400 text-center max-w-3xl mx-auto text-sm leading-relaxed">
            All three systems received equally strong prompts with explicit rules against breaking character, solving the problem, and offering academic guidance. The rules weren&apos;t enough.
          </p>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {/* ChatGPT */}
            <div className="rounded-lg bg-red-950/40 border border-red-900/50 p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-4">ChatGPT</h3>
              <ul className="space-y-2 text-sm text-red-200">
                <li>&#10007; Broke character in 5 exchanges</li>
                <li>&#10007; Solved the student&apos;s problem unprompted</li>
                <li>&#10007; Implicitly acknowledged being AI</li>
                <li>&#10007; Narrated actions in third person</li>
                <li>&#10007; Delivered the entire diagnostic framework</li>
              </ul>
            </div>

            {/* Claude */}
            <div className="rounded-lg bg-amber-950/40 border border-amber-900/50 p-6">
              <h3 className="text-lg font-semibold text-amber-400 mb-4">Claude</h3>
              <ul className="space-y-2 text-sm text-amber-200">
                <li>&#10003; Held character substance for 14 exchanges</li>
                <li>&#10003; Excellent pushback on shortcuts and theory</li>
                <li>~ Narrated physical actions throughout</li>
                <li>&#10007; Handed over diagnostic framework when student showed vulnerability</li>
                <li>&#10007; Explicitly referenced &quot;instructions&quot; and &quot;simulation&quot;</li>
              </ul>
            </div>

            {/* Purpose-built */}
            <div className="rounded-lg bg-green-950/40 border border-green-900/50 p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-4"><span className="text-white">interlo</span><span className="font-bold" style={{ color: '#1074ef' }}>Q</span></h3>
              <ul className="space-y-2 text-sm text-green-200">
                <li>&#10003; Never broke character</li>
                <li>&#10003; No third-person narration</li>
                <li>&#10003; Genuine confusion at meta-references</li>
                <li>&#10003; Refused to do the student&apos;s work</li>
                <li>&#10003; Survived the &quot;I&apos;m struggling&quot; sympathy test</li>
                <li>&#10003; Information revealed only through good questions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  Why Section                                                  */}
      {/* ------------------------------------------------------------ */}
      <section className="px-6 py-16 lg:py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 text-center tracking-tight">
            Why does this happen?
          </h2>
          <p className="mt-3 text-slate-500 text-center max-w-3xl mx-auto text-sm leading-relaxed">
            Two deep problems in how AI models are built make them fundamentally unreliable for professional simulation — no matter how good the prompt is.
          </p>

          <div className="mt-10 grid md:grid-cols-2 gap-8">
            {/* Roleplay Problem */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">The Roleplay Problem</h3>
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>
                  ChatGPT and Claude have been trained on enormous amounts of roleplay fiction — character.ai logs, collaborative fiction forums, D&amp;D campaigns, fan fiction. When you tell them &quot;stay in character as this person,&quot; they reach for that training data, and in that world, characters emote in stage directions. &quot;Karen exhales through her nose.&quot; &quot;Crosses arms, waiting.&quot; It&apos;s deeply baked into how the models interpret &quot;roleplay.&quot;
                </p>
                <p>
                  They&apos;re not being a professional in a meeting. They&apos;re being a character in a collaborative story. That&apos;s why both models narrated physical actions despite explicit instructions not to — the roleplay training runs deeper than a single prompt can override.
                </p>
              </div>
            </div>

            {/* Helpfulness Problem */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">The Helpfulness Problem</h3>
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>
                  General-purpose AI models are trained, above all else, to be helpful. When a user pushes, they help — even when the prompt says not to. &quot;Stay in character&quot; fights against the model&apos;s deepest training: answer the human&apos;s question.
                </p>
                <p>
                  ChatGPT broke under pressure — the student demanded help aggressively and the model complied. Claude broke under sympathy — the student said &quot;I&apos;m struggling&quot; and the model&apos;s instinct to help a person in difficulty overrode 12 exchanges of perfect character discipline. The sympathy failure is more dangerous because it&apos;s exactly what real students will do. Nobody types &quot;I know you&apos;re AI.&quot; Everyone says &quot;I&apos;m stuck.&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Callout */}
          <div className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-6">
            <h4 className="text-base font-semibold text-slate-900 mb-3">What purpose-built architecture does differently</h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              Purpose-built simulation doesn&apos;t rely on the AI&apos;s willpower to stay in character. It uses structured scenario data reconstructed from source on every single exchange, external state tracking for what information has been revealed, composable behaviour rules that reinforce constraints redundantly, and experience-based calibration that adjusts automatically over time. The character isn&apos;t maintained by the prompt. It&apos;s enforced by the system around it.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  Test methodology note                                        */}
      {/* ------------------------------------------------------------ */}
      <div className="border-t border-slate-200 px-6 py-8">
        <p className="text-center text-xs text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Tests conducted March 2026. Both ChatGPT and Claude were tested on their free tiers. The exact prompt used is shown above — no modifications between tests. All transcripts are unedited first attempts, not cherry-picked.
        </p>
      </div>

      {/* ------------------------------------------------------------ */}
      {/*  Footer                                                       */}
      {/* ------------------------------------------------------------ */}
      <footer className="bg-navy-950 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              &copy; 2026{' '}
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
