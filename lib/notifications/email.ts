import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@placementhub.com';
const APP_NAME = 'PlacementHub';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export async function sendNewDriveEmail(
  email: string,
  studentName: string,
  drive: { companyName: string; role: string; closeDate: Date; _id: string }
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Opportunity Available!</h2>
      <p>Hi ${studentName},</p>
      <p>A new placement drive has been posted that matches your profile:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">${drive.companyName}</h3>
        <p style="margin: 5px 0;"><strong>Role:</strong> ${drive.role}</p>
        <p style="margin: 5px 0;"><strong>Apply Before:</strong> ${new Date(drive.closeDate).toLocaleDateString()}</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/drives/${drive._id}" 
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
        View & Apply Now
      </a>
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Don't miss this opportunity! Apply before the deadline.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `New Drive: ${drive.companyName} - ${drive.role}`,
    html,
  });
}

export async function sendStatusChangeEmail(
  email: string,
  studentName: string,
  drive: { companyName: string; role: string },
  status: string
): Promise<boolean> {
  const statusMessages: Record<string, { title: string; message: string; color: string }> = {
    shortlisted: {
      title: 'Congratulations! You are Shortlisted',
      message: 'You have been shortlisted for the next round.',
      color: '#10b981',
    },
    selected: {
      title: 'Congratulations! You are Selected',
      message: 'You have been selected! Check your email for further details.',
      color: '#10b981',
    },
    rejected: {
      title: 'Application Update',
      message: 'Unfortunately, you were not selected this time. Keep applying!',
      color: '#ef4444',
    },
  };

  const statusInfo = statusMessages[status] || {
    title: 'Application Status Update',
    message: `Your application status has been updated to: ${status}`,
    color: '#2563eb',
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${statusInfo.color};">${statusInfo.title}</h2>
      <p>Hi ${studentName},</p>
      <p>${statusInfo.message}</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">${drive.companyName}</h3>
        <p style="margin: 5px 0;"><strong>Role:</strong> ${drive.role}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> ${status.toUpperCase()}</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/applications" 
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
        View Application
      </a>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `${drive.companyName} - Application Status Update`,
    html,
  });
}

export async function sendDeadlineReminderEmail(
  email: string,
  studentName: string,
  drive: { companyName: string; role: string; closeDate: Date; _id: string }
): Promise<boolean> {
  const hoursLeft = Math.round((new Date(drive.closeDate).getTime() - Date.now()) / (1000 * 60 * 60));

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">⏰ Deadline Reminder</h2>
      <p>Hi ${studentName},</p>
      <p>The application deadline for the following drive is approaching:</p>
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
        <h3 style="margin: 0 0 10px 0;">${drive.companyName}</h3>
        <p style="margin: 5px 0;"><strong>Role:</strong> ${drive.role}</p>
        <p style="margin: 5px 0; color: #ef4444;"><strong>Closes in:</strong> ${hoursLeft} hours</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/drives/${drive._id}" 
         style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
        Apply Now
      </a>
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Don't miss out! Apply before the deadline.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `⏰ Deadline Alert: ${drive.companyName} - ${hoursLeft}h left`,
    html,
  });
}
