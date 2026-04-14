import { IStudent } from '@/lib/db/models/Student';
import { IDrive } from '@/lib/db/models/Drive';
import { IApplication } from '@/lib/db/models/Application';
import { IVault } from '@/lib/db/models/Vault';
import { INotification } from '@/lib/db/models/Notification';
import { IOffer } from '@/lib/db/models/Offer';
import { ICompany } from '@/lib/db/models/Company';

export type Student = IStudent;
export type Drive = IDrive;
export type Application = IApplication;
export type Vault = IVault;
export type Notification = INotification;
export type Offer = IOffer;
export type Company = ICompany;

export interface EligibilityInfo {
  isEligible: boolean;
  reasons: string[];
  matchScore: number;
}

export interface DriveWithEligibility extends Drive {
  eligibility: EligibilityInfo;
  application: {
    _id: string;
    status: string;
    appliedAt: Date;
  } | null;
  isNew: boolean;
  deadlineUrgent: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface DashboardStats {
  overview: {
    totalStudents: number;
    totalDrives: number;
    activeDrives: number;
    totalApplications: number;
    placedStudents: number;
    unplacedCount: number;
    placementRate: number;
  };
  departmentStats: Array<{
    department: string;
    total: number;
    placed: number;
    placementRate: string;
  }>;
  topSkills: Array<{
    skill: string;
    count: number;
  }>;
  recentDrives: Drive[];
}

export type UserRole = 'student' | 'admin' | 'placement-officer' | 'company';

export type ApplicationStatus =
  | 'applied'
  | 'under-review'
  | 'shortlisted'
  | 'rejected'
  | 'selected'
  | 'withdrawn';

export type DriveType = 'full-time' | 'internship' | 'ppo';

export type DriveStatus = 'draft' | 'active' | 'closed' | 'completed';

export type NotificationType =
  | 'new-drive'
  | 'status-change'
  | 'deadline-reminder'
  | 'shortlisted'
  | 'selected'
  | 'rejected'
  | 'system';
