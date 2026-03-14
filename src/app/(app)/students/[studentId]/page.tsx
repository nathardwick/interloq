'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Spinner, Button, Avatar } from '@/components/ui';
import { SimulationRow, type SimulationSummary } from '@/components/simulation';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const [simulations, setSimulations] = useState<SimulationSummary[]>([]);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        // Fetch all tutor simulations, then filter client-side by studentId
        const res = await fetch('/api/simulations');
        if (res.status === 403 || res.status === 401) {
          router.replace('/dashboard');
          return;
        }

        const data = await res.json();
        const allSimulations: SimulationSummary[] = data.simulations || [];

        // Filter to this student's simulations
        const filtered = allSimulations.filter((sim) => {
          const sid = sim.studentId as unknown as { _id: string; name: string; email: string };
          return sid?._id === studentId;
        });

        if (filtered.length > 0) {
          const student = filtered[0].studentId as unknown as { _id: string; name: string };
          setStudentName(student.name);
        } else {
          // No simulations — fetch student name from the students list
          const studentsRes = await fetch('/api/tutor/students');
          if (studentsRes.ok) {
            const studentsData = await studentsRes.json();
            const student = (studentsData.students || []).find(
              (s: { _id: string }) => s._id === studentId,
            );
            if (student) {
              setStudentName(student.name);
            } else {
              setError('Student not found');
            }
          }
        }

        setSimulations(filtered);
      } catch (err) {
        console.error('Failed to load student simulations:', err);
        setError('Failed to load simulations');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-navy-600" />
          <p className="text-sm text-slate-400">Loading simulations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <Button variant="secondary" onClick={() => router.push('/students')}>
            <ArrowLeft size={14} />
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  const active = simulations.filter((s) => s.status === 'active' || s.status === 'paused');
  const completed = simulations.filter((s) => s.status === 'completed' || s.status === 'archived');

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <button
          onClick={() => router.push('/students')}
          className="text-slate-500 hover:text-slate-700 transition-colors"
        >
          Students
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">{studentName}</span>
      </div>

      {/* Student header */}
      <div className="flex items-center gap-3 mb-6">
        <Avatar name={studentName} size="lg" />
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{studentName}</h1>
          <p className="text-sm text-slate-500">
            {simulations.length} simulation{simulations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {simulations.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <BookOpen size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">
              This student hasn&apos;t started any simulations yet.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                Active
              </h2>
              <div className="space-y-2">
                {active.map((sim) => (
                  <SimulationRow
                    key={sim._id}
                    simulation={sim}
                    onClick={() => router.push(`/simulation/${sim._id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                Completed
              </h2>
              <div className="space-y-2">
                {completed.map((sim) => (
                  <SimulationRow
                    key={sim._id}
                    simulation={sim}
                    onClick={() => router.push(`/simulation/${sim._id}`)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
