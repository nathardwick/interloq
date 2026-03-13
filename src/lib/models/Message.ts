import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IMessageMetadata {
  flagged?: boolean;
  tutor_visible_only?: boolean;
  [key: string]: unknown;
}

export interface IMessage extends Document {
  simulationId: Types.ObjectId;
  senderType: 'student' | 'client_ai' | 'tutor_note';
  content: string;
  metadata: IMessageMetadata;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  simulationId: { type: Schema.Types.ObjectId, ref: 'Simulation', required: true, index: true },
  senderType: {
    type: String,
    enum: ['student', 'client_ai', 'tutor_note'],
    required: true,
  },
  content: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

MessageSchema.index({ simulationId: 1, createdAt: 1 });

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
