/**
 * Standardized Academic Options for CampusMarket
 * Single source of truth for branches/courses and semester numbers.
 */

export const ACADEMIC_BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Electronics & Telecommunication',
  'Electrical Engineering',
  'Civil Engineering',
  'Business / Commerce',
  'Applied Sciences / Other',
] as const;

export type AcademicBranch = (typeof ACADEMIC_BRANCHES)[number];

export const ACADEMIC_SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type AcademicSemester = (typeof ACADEMIC_SEMESTERS)[number];

export function formatSemesterLabel(sem?: number | null): string {
  if (!sem) return 'Not set';
  return `Semester ${sem}`;
}

export function formatBranchShort(branch?: string | null): string {
  if (!branch) return '';
  switch (branch) {
    case 'Computer Science & Engineering':
      return 'CS';
    case 'Information Technology':
      return 'IT';
    case 'Mechanical Engineering':
      return 'Mech';
    case 'Electronics & Telecommunication':
      return 'E&TC';
    case 'Electrical Engineering':
      return 'EE';
    case 'Civil Engineering':
      return 'Civil';
    case 'Business / Commerce':
      return 'Business';
    case 'Applied Sciences / Other':
      return 'General';
    default:
      return branch.length > 12 ? `${branch.substring(0, 10)}…` : branch;
  }
}
