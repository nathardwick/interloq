import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IOrganisationProfile {
  name: string;
  sector: string;
  size: string;
  structure: string;
  history: string;
  current_context: string;
}

export interface IClientPersona {
  name: string;
  role: string;
  personality_traits: string[];
  communication_style: string;
  what_they_care_about: string;
  blind_spot: string;
  hidden_context: string;
}

export interface IProblem {
  summary: string;
  underlying_causes: string[];
  stakeholder_tensions: string[];
  why_its_wicked: string;
}

export interface IInformationLayers {
  layer_1_upfront: string[];
  layer_2_on_good_questions: string[];
  layer_3_deep_probing: string[];
  layer_4_unknown_to_client: string[];
}

export interface IRevealedLayers {
  layer_1: boolean;
  layer_2: string[];
  layer_3: string[];
  layer_4: string[];
}

export interface ISimulation extends Document {
  institutionId: string | null;
  moduleId: string | null;
  studentId: Types.ObjectId;
  tutorId: Types.ObjectId | null;
  subjectArea: string;
  level: 5 | 6 | 7;
  organisationProfile: IOrganisationProfile;
  problem: IProblem;
  clientPersona: IClientPersona;
  informationLayers: IInformationLayers;
  difficultyLevel: 'standard' | 'pressured' | 'difficult';
  status: 'active' | 'paused' | 'completed' | 'archived';
  revealedLayers: IRevealedLayers;
  exchangeCount: number;
  createdAt: Date;
  lastActivity: Date;
}

const SimulationSchema = new Schema<ISimulation>({
  institutionId: { type: String, default: null },
  moduleId: { type: String, default: null },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tutorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  subjectArea: { type: String, required: true },
  level: { type: Number, enum: [5, 6, 7], required: true },
  organisationProfile: { type: Schema.Types.Mixed, required: true },
  problem: { type: Schema.Types.Mixed, required: true },
  clientPersona: { type: Schema.Types.Mixed, required: true },
  informationLayers: { type: Schema.Types.Mixed, required: true },
  difficultyLevel: {
    type: String,
    enum: ['standard', 'pressured', 'difficult'],
    default: 'standard',
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'archived'],
    default: 'active',
    index: true,
  },
  revealedLayers: {
    type: Schema.Types.Mixed,
    default: { layer_1: true, layer_2: [], layer_3: [], layer_4: [] },
  },
  exchangeCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
});

SimulationSchema.index({ studentId: 1, status: 1 });

export const Simulation: Model<ISimulation> =
  mongoose.models.Simulation || mongoose.model<ISimulation>('Simulation', SimulationSchema);
