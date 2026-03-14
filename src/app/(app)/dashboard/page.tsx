'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, Button, Avatar } from '@/components/ui';
import { BookOpen, Clock, MessageSquare, PlusCircle, Users } from 'lucide-react';

interface SimulationSummary {
  _id: string;
  subjectArea: string;
  level: number;
  organisationProfile: { name: string; sector: string };
  clientPersona: { name: string; role: string };
  difficultyLevel: string;
  status: string;
  exchangeCount: number;
  createdAt: string;
  lastActivity: string;
  studentId?: { _id: string; name: string; email: string };
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function statusVariant(status: string): 'active' | 'paused' | 'completed' {
  if (status === 'active') return 'active';
  if (status === 'paused') return 'paused';
  return 'completed';
}

export default function DashboardPage() {
  const [simulations, setSimulations] = useState<SimulationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'student' | 'tutor'>('student');

  useEffect(() => {
    async function load() {
      try {
        const [simRes, meRes] = await Promise.all([
          fetch('/api/simulations'),
          fetch('/api/auth/me'),
        ]);
        const simData = await simRes.json();
        const meData = await meRes.json();

        setSimulations(simData.simulations || []);
        setUserRole(meData.user?.role || 'student');
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  if (userRole === 'tutor') {
    return <TutorDashboard simulations={simulations} />;
  }

  return <StudentDashboard simulations={simulations} />;
}

/* ------------------------------------------------------------------ */
/*  Student Dashboard                                                  */
/* ------------------------------------------------------------------ */

function StudentDashboard({ simulations }: { simulations: SimulationSummary[] }) {
  const router = useRouter();
  const active = simulations.filter((s) => s.status === 'active' || s.status === 'paused');
  const completed = simulations.filter((s) => s.status === 'completed' || s.status === 'archived');

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-slate-900">My Simulations</h1>
        <Button onClick={() => router.push('/simulation/new')}>
          <PlusCircle size={16} />
          New Simulation
        </Button>
      </div>

      {simulations.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <BookOpen size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500 mb-4">
              No simulations yet. Start your first client engagement.
            </p>
            <Button onClick={() => router.push('/simulation/new')}>
              <PlusCircle size={16} />
              Start Simulation
            </Button>
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

/* ------------------------------------------------------------------ */
/*  Tutor Dashboard                                                    */
/* ------------------------------------------------------------------ */

function TutorDashboard({ simulations }: { simulations: SimulationSummary[] }) {
  const router = useRouter();

  // Group by student
  const byStudent = simulations.reduce<
    Record<string, { name: string; email: string; simulations: SimulationSummary[] }>
  >((acc, sim) => {
    const student = sim.studentId as unknown as { _id: string; name: string; email: string };
    if (!student?._id) return acc;

    if (!acc[student._id]) {
      acc[student._id] = { name: student.name, email: student.email, simulations: [] };
    }
    acc[student._id].simulations.push(sim);
    return acc;
  }, {});

  const students = Object.entries(byStudent);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-slate-900">Students</h1>
        <p className="text-sm text-slate-500 mt-1">
          {students.length} student{students.length !== 1 ? 's' : ''} assigned to you
        </p>
      </div>

      {students.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Users size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">No students assigned yet.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {students.map(([studentId, student]) => {
            const activeCount = student.simulations.filter((s) => s.status === 'active').length;
            return (
              <Card key={studentId}>
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={student.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{student.name}</p>
                    <p className="text-xs text-slate-500">{student.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      {student.simulations.length} simulation
                      {student.simulations.length !== 1 ? 's' : ''}
                    </p>
                    {activeCount > 0 && (
                      <Badge variant="active">{activeCount} active</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  {student.simulations.map((sim) => (
                    <SimulationRow
                      key={sim._id}
                      simulation={sim}
                      onClick={() => router.push(`/simulation/${sim._id}`)}
                      compact
                    />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared simulation row                                              */
/* ------------------------------------------------------------------ */

function SimulationRow({
  simulation,
  onClick,
  compact,
}: {
  simulation: SimulationSummary;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg border border-slate-200 bg-white cursor-pointer hover:border-slate-300 transition-colors ${
        compact ? 'px-3 py-2' : 'px-4 py-3'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-medium text-slate-900 truncate ${compact ? 'text-xs' : 'text-sm'}`}>
            {simulation.organisationProfile.name}
          </p>
          <Badge variant={statusVariant(simulation.status)}>{simulation.status}</Badge>
        </div>
        <p className={`text-slate-500 mt-0.5 truncate ${compact ? 'text-[11px]' : 'text-xs'}`}>
          {simulation.clientPersona.name} — {simulation.clientPersona.role}
        </p>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="level">L{simulation.level}</Badge>
            <Badge variant="difficulty">{simulation.difficultyLevel}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MessageSquare size={12} />
              {simulation.exchangeCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatRelativeTime(simulation.lastActivity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
