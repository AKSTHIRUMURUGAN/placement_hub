import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'new-drive' | 'status-change' | 'deadline-reminder' | 'shortlisted' | 'selected' | 'rejected' | 'system';
  title: string;
  message: string;
  driveId?: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  readAt?: Date;
  channels: {
    inApp: boolean;
    email: boolean;
    whatsapp: boolean;
  };
  emailSent: boolean;
  whatsappSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    type: {
      type: String,
      enum: ['new-drive', 'status-change', 'deadline-reminder', 'shortlisted', 'selected', 'rejected', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    driveId: { type: Schema.Types.ObjectId, ref: 'Drive' },
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
    },
    emailSent: { type: Boolean, default: false },
    whatsappSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: 1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
