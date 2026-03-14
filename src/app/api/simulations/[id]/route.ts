import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Simulation } from '@/lib/models/Simulation';
import { Message } from '@/lib/models/Message';
import { User } from '@/lib/models/User';

interface RouteParams {
  params: { id: string };
}

// Check if a tutor is authorised to view a simulation
async function tutorCanAccess(tutorId: string, studentId: string): Promise<boolean> {
  const student = await User.findById(studentId);
  if (!student) return false;
  return student.assignedTutorId?.toString() === tutorId;
}

// GET /api/simulations/:id — get simulation details + messages
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();

    const simulation = await Simulation.findById(params.id);
    if (!simulation) {
      return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
    }

    // Auth check: students can only see their own, tutors can see assigned students'
    const userId = user._id.toString();
    if (user.role === 'student') {
      if (simulation.studentId.toString() !== userId) {
        return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
      }
    } else {
      const canAccess = await tutorCanAccess(userId, simulation.studentId.toString());
      if (!canAccess) {
        return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
      }
    }

    const messages = await Message.find({ simulationId: simulation._id })
      .sort({ createdAt: 1 });

    return NextResponse.json({ simulation, messages });
  } catch (error) {
    console.error('Get simulation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/simulations/:id — update status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Only students can update simulations' }, { status: 403 });
    }

    const { status } = await request.json();

    if (!status || !['active', 'paused', 'completed', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be active, paused, completed, or archived' },
        { status: 400 },
      );
    }

    await connectDB();

    const simulation = await Simulation.findById(params.id);
    if (!simulation) {
      return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
    }

    if (simulation.studentId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    simulation.status = status;
    simulation.lastActivity = new Date();
    await simulation.save();

    return NextResponse.json({ simulation });
  } catch (error) {
    console.error('Update simulation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
