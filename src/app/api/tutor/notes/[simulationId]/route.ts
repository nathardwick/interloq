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

interface RouteParams {
  params: { simulationId: string };
}

// GET /api/tutor/notes/:simulationId — get all notes for a simulation
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (user.role !== 'tutor') {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    await connectDB();

    // Verify the simulation exists and the tutor has access
    const simulation = await Simulation.findById(params.simulationId);
    if (!simulation) {
      return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
    }

    const canAccess = await tutorCanAccess(user._id.toString(), simulation.studentId.toString());
    if (!canAccess) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    const notes = await TutorNote.find({ simulationId: params.simulationId })
      .sort({ createdAt: -1 });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Get tutor notes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
