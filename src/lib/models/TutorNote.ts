import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITutorNote extends Document {
  simulationId: Types.ObjectId;
  tutorId: Types.ObjectId;
  content: string;
  messageId: Types.ObjectId | null;
  createdAt: Date;
}

const TutorNoteSchema = new Schema<ITutorNote>({
  simulationId: { type: Schema.Types.ObjectId, ref: 'Simulation', required: true, index: true },
  tutorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  messageId: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
  createdAt: { type: Date, default: Date.now },
});

export const TutorNote: Model<ITutorNote> =
  mongoose.models.TutorNote || mongoose.model<ITutorNote>('TutorNote', TutorNoteSchema);
