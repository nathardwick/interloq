import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/models/User';
import { Simulation } from '@/lib/models/Simulation';

// GET /api/tutor/students — list students assigned to this tutor
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (user.role !== 'tutor') {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    await connectDB();

    // Find all students assigned to this tutor
    const students = await User.find({ assignedTutorId: user._id, role: 'student' })
      .select('-password')
      .lean();

    // Get simulation counts and last activity for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const simulations = await Simulation.find({ studentId: student._id })
          .select('lastActivity')
          .lean();

        const lastActivity = simulations.length > 0
          ? simulations.reduce((latest, sim) => {
              const activity = sim.lastActivity || sim.createdAt;
              return activity > latest ? activity : latest;
            }, new Date(0))
          : null;

        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          simulationCount: simulations.length,
          lastActivity,
        };
      }),
    );

    return NextResponse.json({ students: studentsWithStats });
  } catch (error) {
    console.error('Get tutor students error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
