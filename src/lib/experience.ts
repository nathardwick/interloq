import { connectDB } from '@/lib/db';
import { Simulation } from '@/lib/models/Simulation';

export type ExperienceTier = 'novice' | 'developing' | 'proficient';

export async function getExperienceTier(
  studentId: string,
  subjectArea: string,
): Promise<ExperienceTier> {
  await connectDB();

  const count = await Simulation.countDocuments({
    studentId,
    subjectArea,
    status: 'completed',
  });

  if (count >= 6) return 'proficient';
  if (count >= 3) return 'developing';
  return 'novice';
}
