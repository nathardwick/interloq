import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Simulation } from '@/lib/models/Simulation';
import { Message } from '@/lib/models/Message';
import { User } from '@/lib/models/User';
import { getClientResponse } from '@/lib/ai';
import { getExperienceTier } from '@/lib/experience';

interface RouteParams {
  params: { id: string };
}

async function tutorCanAccess(tutorId: string, studentId: string): Promise<boolean> {
  const student = await User.findById(studentId);
  if (!student) return false;
  return student.assignedTutorId?.toString() === tutorId;
}

// GET /api/simulations/:id/messages — get all messages for a simulation
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

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/simulations/:id/messages — send a student message, get client response
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Only students can send messages' }, { status: 403 });
    }

    const { content } = await request.json();

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    await connectDB();

    const simulation = await Simulation.findById(params.id);
    if (!simulation) {
      return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
    }

    if (simulation.studentId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    if (simulation.status !== 'active') {
      return NextResponse.json(
        { error: 'Simulation is not active' },
        { status: 400 },
      );
    }

    // 1. Save the student message
    const studentMessage = await Message.create({
      simulationId: simulation._id,
      senderType: 'student',
      content: content.trim(),
    });

    // 2. Get experience tier
    const experienceTier = await getExperienceTier(
      user._id.toString(),
      simulation.subjectArea,
    );

    // 3. Get all previous messages (before the new student message)
    const previousMessages = await Message.find({ simulationId: simulation._id })
      .sort({ createdAt: 1 });

    // 4. Get client response (previous messages already include the student message we just saved)
    // Remove the just-saved student message from history since getClientResponse appends it separately
    const historyMessages = previousMessages.filter(
      (m) => m._id.toString() !== studentMessage._id.toString(),
    );

    const clientResponseText = await getClientResponse(
      simulation,
      historyMessages,
      content.trim(),
      experienceTier,
    );

    // 5. Save the client response
    const clientMessage = await Message.create({
      simulationId: simulation._id,
      senderType: 'client_ai',
      content: clientResponseText,
    });

    // 6. Update simulation metadata
    simulation.lastActivity = new Date();
    simulation.exchangeCount += 1;
    await simulation.save();

    return NextResponse.json({
      studentMessage,
      clientMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
