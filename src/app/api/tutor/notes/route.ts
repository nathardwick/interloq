import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/models/User';
import { Simulation } from '@/lib/models/Simulation';
import { TutorNote } from '@/lib/models/TutorNote';

// Check if a tutor is authorised to access a simulation
async function tutorCanAccess(tutorId: string, studentId: string): Promise<boolean> {
  const student = await User.findById(studentId);
  if (!student) return false;
  return student.assignedTutorId?.toString() === tutorId;
}

// POST /api/tutor/notes — create a new tutor note
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (user.role !== 'tutor') {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    const { simulationId, content, messageId } = await request.json();

    if (!simulationId || !content) {
      return NextResponse.json(
        { error: 'simulationId and content are required' },
        { status: 400 },
      );
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content must be a non-empty string' }, { status: 400 });
    }

    await connectDB();

    // Verify the simulation exists and the tutor has access
    const simulation = await Simulation.findById(simulationId);
    if (!simulation) {
      return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
    }

    const canAccess = await tutorCanAccess(user._id.toString(), simulation.studentId.toString());
    if (!canAccess) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    const note = await TutorNote.create({
      simulationId,
      tutorId: user._id,
      content: content.trim(),
      messageId: messageId || null,
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('Create tutor note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
