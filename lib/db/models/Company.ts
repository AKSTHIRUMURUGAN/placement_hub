import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  logo?: string;
  about: string;
  website?: string;
  industry: string;
  hrEmail: string;
  hrName: string;
  hrPhone?: string;
  firebaseUid?: string;
  pastDrives: mongoose.Types.ObjectId[];
  verifiedBy?: mongoose.Types.ObjectId;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, unique: true },
    logo: { type: String },
    about: { type: String, required: true },
    website: { type: String },
    industry: { type: String, required: true },
    hrEmail: { type: String, required: true, unique: true },
    hrName: { type: String, required: true },
    hrPhone: { type: String },
    firebaseUid: { type: String, unique: true, sparse: true },
    pastDrives: [{ type: Schema.Types.ObjectId, ref: 'Drive' }],
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'Student' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CompanySchema.index({ name: 'text' });
CompanySchema.index({ hrEmail: 1 });

const Company: Model<ICompany> = mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);

export default Company;
