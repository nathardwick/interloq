'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Select, Spinner } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

const subjectOptions = [
  { value: '', label: 'Select a subject area...' },
  { value: 'HRM', label: 'Human Resource Management' },
  { value: 'Leadership', label: 'Leadership & Management' },
  { value: 'Strategy', label: 'Strategy & Planning' },
  { value: 'Organisational Behaviour', label: 'Organisational Behaviour' },
  { value: 'Change Management', label: 'Change Management' },
  { value: 'Employee Relations', label: 'Employee Relations' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Operations Management', label: 'Operations Management' },
  { value: 'Business Ethics', label: 'Business Ethics' },
  { value: 'Entrepreneurship', label: 'Entrepreneurship & Innovation' },
];

const levelOptions = [
  { value: '', label: 'Select your level...' },
  { value: '5', label: 'Level 5 (Foundation / Second Year)' },
  { value: '6', label: 'Level 6 (Honours / Final Year)' },
  { value: '7', label: 'Level 7 (Postgraduate / MBA)' },
];

const difficultyOptions = [
  { value: 'standard', label: 'Standard — Cooperative, open, patient' },
  { value: 'pressured', label: 'Pressured — Under time pressure, expects value' },
  { value: 'difficult', label: 'Difficult — Guarded, skeptical, challenging' },
];

export default function NewSimulationPage() {
  const router = useRouter();
  const [subjectArea, setSubjectArea] = useState('');
  const [level, setLevel] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!subjectArea || !level) {
      setError('Please select both a subject area and level.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectArea,
          level: parseInt(level),
          difficultyLevel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create simulation.');
        return;
      }

      router.push(`/simulation/${data.simulation._id}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Back to simulations
      </button>

      <h1 className="text-lg font-semibold text-slate-900 mb-1">New Simulation</h1>
      <p className="text-sm text-slate-500 mb-6">
        Choose your subject area and level. A client scenario will be generated for you.
      </p>

      <Card>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" className="text-navy-600 mb-4" />
            <p className="text-sm font-medium text-slate-700">
              Setting up your client scenario...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              This may take a moment
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <Select
              id="subject"
              label="Subject Area"
              description="The domain for your client's organisational problem"
              options={subjectOptions}
              value={subjectArea}
              onChange={(e) => setSubjectArea(e.target.value)}
            />

            <Select
              id="level"
              label="Academic Level"
              description="Calibrates the complexity and ambiguity of the scenario"
              options={levelOptions}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            />

            <Select
              id="difficulty"
              label="Client Difficulty"
              description="How cooperative or challenging the client will be to work with"
              options={difficultyOptions}
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(e.target.value)}
            />

            <Button type="submit" className="w-full mt-2">
              Start Simulation
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
