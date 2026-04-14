import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApplication extends Document {
  studentId: mongoose.Types.ObjectId;
  driveId: mongoose.Types.ObjectId;
  status: 'applied' | 'under-review' | 'shortlisted' | 'rejected' | 'selected' | 'withdrawn';
  currentRound?: string;
  submittedData: {
    resume?: string;
    cgpa?: number;
    department?: string;
    skills?: string[];
    extraFields?: Record<string, any>;
    additionalAnswers?: Record<string, any>;
  };
  timeline: Array<{
    status: string;
    date: Date;
    note?: string;
  }>;
  appliedAt: Date;
  withdrawnAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    driveId: { type: Schema.Types.ObjectId, ref: 'Drive', required: true },
    status: {
      type: String,
      enum: ['applied', 'under-review', 'shortlisted', 'rejected', 'selected', 'withdrawn'],
      default: 'applied',
    },
    currentRound: { type: String },
    submittedData: {
      resume: { type: String },
      cgpa: { type: Number },
      department: { type: String },
      skills: [{ type: String }],
      extraFields: { type: Schema.Types.Mixed },
      additionalAnswers: { type: Schema.Types.Mixed },
    },
    timeline: [
      {
        status: { type: String, required: true },
        date: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    appliedAt: { type: Date, default: Date.now },
    withdrawnAt: { type: Date },
  },
  { timestamps: true }
);

// Compound index to ensure one application per student per drive
ApplicationSchema.index({ studentId: 1, driveId: 1 }, { unique: true });
ApplicationSchema.index({ driveId: 1, status: 1 });
ApplicationSchema.index({ studentId: 1, status: 1 });

const Application: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
