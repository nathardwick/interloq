import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Simulation } from '@/lib/models/Simulation';
import { Message } from '@/lib/models/Message';
import { User } from '@/lib/models/User';
import { generateSimulation, getClientResponse } from '@/lib/ai';
import { getExperienceTier } from '@/lib/experience';

// GET /api/simulations — list simulations for current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();

    if (user.role === 'student') {
      const simulations = await Simulation.find({ studentId: user._id })
        .sort({ lastActivity: -1 })
        .select('-informationLayers -revealedLayers');
      return NextResponse.json({ simulations });
    }

    // Tutor: find all students assigned to this tutor, then their simulations
    const students = await User.find({
      assignedTutorId: user._id,
      role: 'student',
    }).select('_id');

    const studentIds = students.map((s) => s._id);
    const simulations = await Simulation.find({ studentId: { $in: studentIds } })
      .sort({ lastActivity: -1 })
      .select('-informationLayers -revealedLayers')
      .populate('studentId', 'name email');

    return NextResponse.json({ simulations });
  } catch (error) {
    console.error('List simulations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/simulations — create a new simulation
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Only students can create simulations' }, { status: 403 });
    }

    const { subjectArea, level, difficultyLevel } = await request.json();

    if (!subjectArea || !level) {
      return NextResponse.json(
        { error: 'subjectArea and level are required' },
        { status: 400 },
      );
    }

    if (![5, 6, 7].includes(level)) {
      return NextResponse.json({ error: 'Level must be 5, 6, or 7' }, { status: 400 });
    }

    await connectDB();

    // Generate the scenario via Claude
    const generated = await generateSimulation(subjectArea, level);

    // Create the simulation document
    const simulation = await Simulation.create({
      studentId: user._id,
      tutorId: user.assignedTutorId,
      subjectArea,
      level,
      organisationProfile: generated.organisation,
      problem: generated.problem,
      clientPersona: generated.client_persona,
      informationLayers: generated.information_layers,
      difficultyLevel: difficultyLevel || 'standard',
      revealedLayers: { layer_1: true, layer_2: [], layer_3: [], layer_4: [] },
      exchangeCount: 0,
    });

    // Get the student's experience tier for this subject
    const experienceTier = await getExperienceTier(
      user._id.toString(),
      subjectArea,
    );

    // Generate the client's opening message
    const openingMessage = await getClientResponse(
      simulation,
      [], // no history yet
      'Please introduce yourself and explain why you have brought in external help.',
      experienceTier,
    );

    // Save the opening message
    const message = await Message.create({
      simulationId: simulation._id,
      senderType: 'client_ai',
      content: openingMessage,
    });

    return NextResponse.json({
      simulation,
      openingMessage: message,
    }, { status: 201 });
  } catch (error) {
    console.error('Create simulation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
