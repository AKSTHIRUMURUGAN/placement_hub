import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudent extends Document {
  firebaseUid: string;
  email: string;
  name: string;
  regNo: string;
  department: string;
  cgpa: number;
  graduationYear: number;
  degree: string;
  activeBacklogs: number;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  role: 'student' | 'admin' | 'placement-officer' | 'company';
  isActive: boolean;
  isBlacklisted: boolean;
  blacklistReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    regNo: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    cgpa: { type: Number, required: true, min: 0, max: 10 },
    graduationYear: { type: Number, required: true },
    degree: { type: String, required: true, enum: ['B.E.', 'B.Tech', 'M.E.', 'M.Tech', 'MBA', 'MCA'] },
    activeBacklogs: { type: Number, default: 0, min: 0 },
    phone: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    role: { type: String, enum: ['student', 'admin', 'placement-officer', 'company'], default: 'student' },
    isActive: { type: Boolean, default: true },
    isBlacklisted: { type: Boolean, default: false },
    blacklistReason: { type: String },
  },
  { timestamps: true }
);

// Indexes for efficient queries (removed duplicate indexes)
StudentSchema.index({ department: 1, cgpa: -1 });
StudentSchema.index({ graduationYear: 1 });

const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);

export default Student;
