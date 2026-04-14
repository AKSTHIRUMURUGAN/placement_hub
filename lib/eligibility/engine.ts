import { IStudent } from '../db/models/Student';
import { IDrive } from '../db/models/Drive';
import { IVault } from '../db/models/Vault';

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
  matchScore: number; // 0-100
}

export function checkEligibility(
  student: IStudent,
  drive: IDrive,
  vault?: IVault
): EligibilityResult {
  const reasons: string[] = [];
  let isEligible = true;
  let matchScore = 100;

  // Check CGPA
  if (student.cgpa < drive.eligibility.minCgpa) {
    isEligible = false;
    reasons.push(`CGPA ${drive.eligibility.minCgpa} required, you have ${student.cgpa}`);
    matchScore -= 30;
  }

  // Check Department
  if (
    drive.eligibility.departments.length > 0 &&
    !drive.eligibility.departments.includes(student.department)
  ) {
    isEligible = false;
    reasons.push(`Only for ${drive.eligibility.departments.join(', ')} departments`);
    matchScore -= 25;
  }

  // Check Backlogs
  if (student.activeBacklogs > drive.eligibility.maxBacklogs) {
    isEligible = false;
    reasons.push(
      `Maximum ${drive.eligibility.maxBacklogs} backlogs allowed, you have ${student.activeBacklogs}`
    );
    matchScore -= 20;
  }

  // Check Degree
  if (
    drive.eligibility.degrees.length > 0 &&
    !drive.eligibility.degrees.includes(student.degree)
  ) {
    isEligible = false;
    reasons.push(`Only for ${drive.eligibility.degrees.join(', ')} degrees`);
    matchScore -= 15;
  }

  // Check Graduation Year
  if (
    drive.eligibility.graduationYears.length > 0 &&
    !drive.eligibility.graduationYears.includes(student.graduationYear)
  ) {
    isEligible = false;
    reasons.push(`Only for ${drive.eligibility.graduationYears.join(', ')} batch`);
    matchScore -= 10;
  }

  // Check Skills (if vault provided)
  if (vault && drive.eligibility.requiredSkills.length > 0) {
    const studentSkills = vault.skills.map((s) => s.name.toLowerCase());
    const requiredSkills = drive.eligibility.requiredSkills.map((s) => s.toLowerCase());
    const matchingSkills = requiredSkills.filter((skill) => studentSkills.includes(skill));

    if (matchingSkills.length === 0) {
      isEligible = false;
      reasons.push(`Required skills: ${drive.eligibility.requiredSkills.join(', ')}`);
      matchScore -= 20;
    } else if (matchingSkills.length < requiredSkills.length) {
      const missingSkills = requiredSkills.filter((skill) => !studentSkills.includes(skill));
      reasons.push(`Missing skills: ${missingSkills.join(', ')}`);
      matchScore -= 10;
    }
  }

  // Check if student is blacklisted
  if (student.isBlacklisted) {
    isEligible = false;
    reasons.push('Your profile is currently on hold');
    matchScore = 0;
  }

  // Check if student is active
  if (!student.isActive) {
    isEligible = false;
    reasons.push('Your profile is inactive');
    matchScore = 0;
  }

  // Ensure matchScore is not negative
  matchScore = Math.max(0, matchScore);

  return {
    isEligible,
    reasons,
    matchScore,
  };
}

export function calculateVaultCompleteness(vault: IVault): number {
  let score = 0;
  const weights = {
    resume: 20,
    skills: 15,
    projects: 15,
    internships: 10,
    certificates: 10,
    github: 10,
    linkedin: 10,
    portfolio: 5,
    marks: 5,
  };

  // Resume
  if (vault.resumes.length > 0) score += weights.resume;

  // Skills
  if (vault.skills.length >= 5) {
    score += weights.skills;
  } else if (vault.skills.length > 0) {
    score += (vault.skills.length / 5) * weights.skills;
  }

  // Projects
  if (vault.projects.length >= 3) {
    score += weights.projects;
  } else if (vault.projects.length > 0) {
    score += (vault.projects.length / 3) * weights.projects;
  }

  // Internships
  if (vault.internships.length > 0) score += weights.internships;

  // Certificates
  if (vault.certificates.length >= 3) {
    score += weights.certificates;
  } else if (vault.certificates.length > 0) {
    score += (vault.certificates.length / 3) * weights.certificates;
  }

  // Extra fields
  if (vault.extraFields.github) score += weights.github;
  if (vault.extraFields.linkedin) score += weights.linkedin;
  if (vault.extraFields.portfolio) score += weights.portfolio;
  if (vault.extraFields.marks10th && vault.extraFields.marks12th) score += weights.marks;

  return Math.round(score);
}

export function getMissingFields(vault: IVault, requiredFields: string[]): string[] {
  const missing: string[] = [];

  for (const field of requiredFields) {
    switch (field) {
      case 'resume':
        if (vault.resumes.length === 0) missing.push('resume');
        break;
      case 'github':
        if (!vault.extraFields.github) missing.push('github');
        break;
      case 'linkedin':
        if (!vault.extraFields.linkedin) missing.push('linkedin');
        break;
      case 'portfolio':
        if (!vault.extraFields.portfolio) missing.push('portfolio');
        break;
      case 'leetcode':
        if (!vault.extraFields.leetcode) missing.push('leetcode');
        break;
      case 'codeforces':
        if (!vault.extraFields.codeforces) missing.push('codeforces');
        break;
      case 'marks10th':
        if (!vault.extraFields.marks10th) missing.push('10th marks');
        break;
      case 'marks12th':
        if (!vault.extraFields.marks12th) missing.push('12th marks');
        break;
      default:
        if (!vault.extraFields[field]) missing.push(field);
    }
  }

  return missing;
}
