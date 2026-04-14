import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOffer extends Document {
  studentId: mongoose.Types.ObjectId;
  driveId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  companyName: string;
  role: string;
  ctc?: number;
  stipend?: number;
  joiningDate?: Date;
  offerLetterUrl?: string;
  offerDate: Date;
  accepted: boolean;
  acceptedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    driveId: { type: Schema.Types.ObjectId, ref: 'Drive', required: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    companyName: { type: String, required: true },
    role: { type: String, required: true },
    ctc: { type: Number },
    stipend: { type: Number },
    joiningDate: { type: Date },
    offerLetterUrl: { type: String },
    offerDate: { type: Date, default: Date.now },
    accepted: { type: Boolean, default: false },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

OfferSchema.index({ studentId: 1 });
OfferSchema.index({ driveId: 1 });
OfferSchema.index({ offerDate: -1 });

const Offer: Model<IOffer> = mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);

export default Offer;
