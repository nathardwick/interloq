import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Models — import after mongoose is available
import { User } from '../src/lib/models/User';
import { Simulation } from '../src/lib/models/Simulation';
import { Message } from '../src/lib/models/Message';
import { TutorNote } from '../src/lib/models/TutorNote';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interloq';

async function seed() {
  console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.\n');

  // Clear existing data
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Simulation.deleteMany({}),
    Message.deleteMany({}),
    TutorNote.deleteMany({}),
  ]);
  console.log('Cleared.\n');

  // Create tutor first (we need the ID for the student)
  const hashedPassword = await bcrypt.hash('test1234', 12);

  console.log('Creating tutor...');
  const tutor = await User.create({
    name: 'Dr Sarah Chen',
    email: 'tutor@test.com',
    password: hashedPassword,
    role: 'tutor',
  });
  console.log(`  Tutor created: ${tutor.email} (${tutor._id})`);

  console.log('Creating student...');
  const student = await User.create({
    name: 'Alex Morgan',
    email: 'student@test.com',
    password: hashedPassword,
    role: 'student',
    assignedTutorId: tutor._id,
  });
  console.log(`  Student created: ${student.email} (${student._id})`);
  console.log(`  Assigned to tutor: ${tutor.name}\n`);

  console.log('Seed complete.');
  console.log('---');
  console.log('Test credentials:');
  console.log('  Student: student@test.com / test1234');
  console.log('  Tutor:   tutor@test.com / test1234');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
