import mongoose, { Schema, Document, Model } from 'mongoose';

interface Resume {
  url: string;
  fileName: string;
  type: string; // 'CSE Resume', 'Core Resume', 'General'
  uploadedAt: Date;
}

interface Certificate {
  url: string;
  fileName: string;
  category: string; // 'technical', 'soft skills', 'NPTEL', 'coursera', 'other'
  title: string;
  uploadedAt: Date;
}

interface Internship {
  company: string;
  role: string;
  duration: string;
  startDate: Date;
  endDate: Date;
  stipend?: number;
  certificateUrl?: string;
  description: string;
}

interface Project {
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  startDate?: Date;
  endDate?: Date;
}

interface Skill {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced';
}

interface ExtraFields {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  leetcode?: string;
  codeforces?: string;
  hackerrank?: string;
  marks10th?: number;
  marks12th?: number;
  [key: string]: any;
}

export interface IVault extends Document {
  studentId: mongoose.Types.ObjectId;
  resumes: Resume[];
  certificates: Certificate[];
  internships: Internship[];
  projects: Project[];
  skills: Skill[];
  extraFields: ExtraFields;
  completenessScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const VaultSchema = new Schema<IVault>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
    resumes: [
      {
        url: { type: String, required: true },
        fileName: { type: String, required: true },
        type: { type: String, default: 'General' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    certificates: [
      {
        url: { type: String, required: true },
        fileName: { type: String, required: true },
        category: { type: String, required: true },
        title: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    internships: [
      {
        company: { type: String, required: true },
        role: { type: String, required: true },
        duration: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        stipend: { type: Number },
        certificateUrl: { type: String },
        description: { type: String, required: true },
      },
    ],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        techStack: [{ type: String }],
        githubUrl: { type: String },
        demoUrl: { type: String },
        imageUrl: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
      },
    ],
    skills: [
      {
        name: { type: String, required: true },
        proficiency: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
      },
    ],
    extraFields: {
      type: Schema.Types.Mixed,
      default: {},
    },
    completenessScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

// Index for fast student lookup
VaultSchema.index({ studentId: 1 });

const Vault: Model<IVault> = mongoose.models.Vault || mongoose.model<IVault>('Vault', VaultSchema);

export default Vault;
