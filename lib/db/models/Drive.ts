import mongoose, { Schema, Document, Model } from 'mongoose';

interface Eligibility {
  minCgpa: number;
  departments: string[];
  requiredSkills: string[];
  maxBacklogs: number;
  degrees: string[];
  graduationYears: number[];
}

interface Round {
  name: string;
  date?: Date;
  venue?: string;
  link?: string;
  instructions?: string;
}

export interface IDrive extends Document {
  companyName: string;
  companyLogo?: string;
  role: string;
  type: 'full-time' | 'internship' | 'ppo';
  employmentType: 'full-time' | 'part-time' | 'contract';
  ctc?: number;
  stipend?: number;
  location: string;
  workMode: 'remote' | 'onsite' | 'hybrid';
  jdUrl?: string;
  description: string;
  eligibility: Eligibility;
  requiredFields: string[];
  additionalQuestions: Array<{
    question: string;
    type: 'text' | 'dropdown' | 'file' | 'date';
    options?: string[];
    required: boolean;
  }>;
  rounds: Round[];
  openDate: Date;
  closeDate: Date;
  resultDate?: Date;
  status: 'draft' | 'active' | 'closed' | 'completed';
  createdBy: mongoose.Types.ObjectId;
  companyId?: mongoose.Types.ObjectId;
  applicantCount: number;
  shortlistedCount: number;
  selectedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const DriveSchema = new Schema<IDrive>(
  {
    companyName: { type: String, required: true },
    companyLogo: { type: String },
    role: { type: String, required: true },
    type: { type: String, enum: ['full-time', 'internship', 'ppo'], required: true },
    employmentType: { type: String, enum: ['full-time', 'part-time', 'contract'], default: 'full-time' },
    ctc: { type: Number },
    stipend: { type: Number },
    location: { type: String, required: true },
    workMode: { type: String, enum: ['remote', 'onsite', 'hybrid'], default: 'onsite' },
    jdUrl: { type: String },
    description: { type: String, required: true },
    eligibility: {
      minCgpa: { type: Number, required: true, min: 0, max: 10 },
      departments: [{ type: String, required: true }],
      requiredSkills: [{ type: String }],
      maxBacklogs: { type: Number, default: 0, min: 0 },
      degrees: [{ type: String }],
      graduationYears: [{ type: Number }],
    },
    requiredFields: [{ type: String }],
    additionalQuestions: [
      {
        question: { type: String, required: true },
        type: { type: String, enum: ['text', 'dropdown', 'file', 'date'], required: true },
        options: [{ type: String }],
        required: { type: Boolean, default: false },
      },
    ],
    rounds: [
      {
        name: { type: String, required: true },
        date: { type: Date },
        venue: { type: String },
        link: { type: String },
        instructions: { type: String },
      },
    ],
    openDate: { type: Date, required: true },
    closeDate: { type: Date, required: true },
    resultDate: { type: Date },
    status: { type: String, enum: ['draft', 'active', 'closed', 'completed'], default: 'draft' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
    applicantCount: { type: Number, default: 0 },
    shortlistedCount: { type: Number, default: 0 },
    selectedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for efficient queries
DriveSchema.index({ closeDate: 1, status: 1 });
DriveSchema.index({ type: 1, status: 1 });
DriveSchema.index({ 'eligibility.departments': 1 });
DriveSchema.index({ companyName: 'text', role: 'text' });

const Drive: Model<IDrive> = mongoose.models.Drive || mongoose.model<IDrive>('Drive', DriveSchema);

export default Drive;
