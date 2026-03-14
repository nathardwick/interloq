'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Avatar, Spinner, Badge } from '@/components/ui';
import { formatRelativeTime } from '@/components/simulation';
import { Users, ChevronRight } from 'lucide-react';

interface StudentSummary {
  _id: string;
  name: string;
  email: string;
  simulationCount: number;
  lastActivity: string | null;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/tutor/students');
        if (res.status === 403) {
          router.replace('/dashboard');
          return;
        }
        const data = await res.json();
        setStudents(data.students || []);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-navy-600" />
          <p className="text-sm text-slate-400">Loading students...</p>
        </div>
      </div>
    );
  }

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
        <div className="space-y-2">
          {students.map((student) => (
            <Card
              key={student._id}
              onClick={() => router.push(`/students/${student._id}`)}
            >
              <div className="flex items-center gap-3">
                <Avatar name={student.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{student.name}</p>
                  <p className="text-xs text-slate-500">{student.email}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                  <div className="text-right">
                    <p>
                      {student.simulationCount} simulation{student.simulationCount !== 1 ? 's' : ''}
                    </p>
                    {student.lastActivity && (
                      <p className="mt-0.5">
                        Active {formatRelativeTime(student.lastActivity)}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
