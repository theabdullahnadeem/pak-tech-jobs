// Pure filter predicate — mirrors the Prisma where clause logic
// Used for property-based testing without a real DB
export interface JobFilterParams {
  q?: string;
  category?: string;
  city?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  responseRate?: number;
}

export interface JobRecord {
  title: string;
  description: string;
  skills: string[];
  city: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  category: string[];
  isActive: boolean;
  isClosed: boolean;
  recruiterResponseRate: number;
}

export function matchesFilters(job: JobRecord, filters: JobFilterParams): boolean {
  // Always filter active, non-closed jobs
  if (!job.isActive || job.isClosed) return false;

  // Keyword search
  if (filters.q) {
    const q = filters.q.toLowerCase();
    const inTitle = job.title.toLowerCase().includes(q);
    const inDesc = job.description.toLowerCase().includes(q);
    const inSkills = job.skills.some(s => s.toLowerCase() === q);
    if (!inTitle && !inDesc && !inSkills) return false;
  }

  // Category filter
  if (filters.category && !job.category.includes(filters.category)) return false;

  // City filter (case-insensitive contains)
  if (filters.city && !job.city.toLowerCase().includes(filters.city.toLowerCase())) return false;

  // JobType filter
  if (filters.jobType && job.jobType !== filters.jobType) return false;

  // ExperienceLevel filter
  if (filters.experienceLevel && job.experienceLevel !== filters.experienceLevel) return false;

  // Salary range overlap
  if (filters.salaryMin !== undefined && job.salaryMax < filters.salaryMin) return false;
  if (filters.salaryMax !== undefined && job.salaryMin > filters.salaryMax) return false;

  // Response rate filter
  if (filters.responseRate !== undefined && job.recruiterResponseRate < filters.responseRate) return false;

  return true;
}
