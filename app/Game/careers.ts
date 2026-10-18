import type { SkillName } from './skills';

export type CareerJobId = 'ice-cream-cafe' | 'fish-grill' | 'surf-shop';

export type CareerJob = {
  id: CareerJobId;
  title: string;
  career: string;
  employer: string;
  locationId: string;
  tasks: string[];
  basePay: number;
  skillRewards: Partial<Record<SkillName, number>>;
};

export type CareerJobStats = {
  shiftsCompleted: number;
  lifetimeEarnings: number;
};

export type CareerProgress = {
  acceptedJobIds: CareerJobId[];
  activeJobId: CareerJobId | null;
  activeShiftJobId: CareerJobId | null;
  shiftTaskIndex: number;
  jobs: Record<CareerJobId, CareerJobStats>;
};

export const CAREER_JOBS: CareerJob[] = [
  {
    id: 'ice-cream-cafe',
    title: 'Ice Cream Cafe Crew',
    career: 'Food & Hospitality',
    employer: 'Ice Cream Cafe',
    locationId: 'ice-cream-cafe',
    tasks: ['Prepare a cone', 'Serve an order', 'Restock the counter'],
    basePay: 25_000,
    skillRewards: { cooking: 15, hustle: 40 },
  },
  {
    id: 'fish-grill',
    title: 'Fish Grill Server',
    career: 'Food & Hospitality',
    employer: 'Fish Grill',
    locationId: 'fish-grill',
    tasks: ['Take a table order', 'Serve a meal', 'Clear a table'],
    basePay: 30_000,
    skillRewards: { cooking: 10, social: 15, hustle: 35 },
  },
  {
    id: 'surf-shop',
    title: 'Surf Shop Assistant',
    career: 'Retail',
    employer: 'Surf Shop',
    locationId: 'surf-shop',
    tasks: ['Unpack a delivery', 'Help a customer', 'Arrange the display'],
    basePay: 22_000,
    skillRewards: { social: 15, hustle: 40 },
  },
];

export const INITIAL_CAREER_PROGRESS: CareerProgress = {
  acceptedJobIds: [],
  activeJobId: null,
  activeShiftJobId: null,
  shiftTaskIndex: 0,
  jobs: {
    'ice-cream-cafe': { shiftsCompleted: 0, lifetimeEarnings: 0 },
    'fish-grill': { shiftsCompleted: 0, lifetimeEarnings: 0 },
    'surf-shop': { shiftsCompleted: 0, lifetimeEarnings: 0 },
  },
};

const PROMOTION_REQUIREMENTS = [0, 3, 8, 15];
const PROMOTION_TITLES = ['Trainee', 'Crew Member', 'Senior Crew', 'Shift Supervisor'];

export function getCareerRank(shiftsCompleted: number) {
  const completed = Math.max(0, Math.floor(shiftsCompleted));
  let index = PROMOTION_REQUIREMENTS.length - 1;
  while (index > 0 && completed < PROMOTION_REQUIREMENTS[index]) index -= 1;
  const nextRequirement = PROMOTION_REQUIREMENTS[index + 1] ?? null;
  return {
    level: index + 1,
    title: PROMOTION_TITLES[index],
    shiftsCompleted: completed,
    nextRequirement,
    shiftsToNext: nextRequirement === null ? 0 : Math.max(0, nextRequirement - completed),
    promotionBonus: index * 0.05,
  };
}

export function getCareerShiftPay(job: CareerJob, shiftsCompleted: number, hustleLevel: number) {
  const rank = getCareerRank(shiftsCompleted);
  const hustleBonus = hustleLevel >= 2 ? 0.1 : 0;
  return Math.round(job.basePay * (1 + rank.promotionBonus + hustleBonus));
}

export function isCareerJobId(value: unknown): value is CareerJobId {
  return typeof value === 'string' && CAREER_JOBS.some((job) => job.id === value);
}

export function sanitizeCareerProgress(value: Partial<CareerProgress>): CareerProgress {
  const acceptedJobIds = Array.isArray(value.acceptedJobIds)
    ? [...new Set(value.acceptedJobIds.filter(isCareerJobId))]
    : [];
  const jobs = { ...INITIAL_CAREER_PROGRESS.jobs };
  if (value.jobs && typeof value.jobs === 'object') {
    for (const job of CAREER_JOBS) {
      const saved = value.jobs[job.id];
      if (!saved || typeof saved !== 'object') continue;
      jobs[job.id] = {
        shiftsCompleted: Number.isInteger(saved.shiftsCompleted) ? Math.max(0, saved.shiftsCompleted) : 0,
        lifetimeEarnings: Number.isFinite(saved.lifetimeEarnings) ? Math.max(0, saved.lifetimeEarnings) : 0,
      };
    }
  }
  const activeJobId = isCareerJobId(value.activeJobId) && acceptedJobIds.includes(value.activeJobId)
    ? value.activeJobId
    : acceptedJobIds[0] ?? null;
  const activeShiftJobId = isCareerJobId(value.activeShiftJobId) && acceptedJobIds.includes(value.activeShiftJobId)
    ? value.activeShiftJobId
    : null;
  const taskLimit = activeShiftJobId ? CAREER_JOBS.find((job) => job.id === activeShiftJobId)!.tasks.length : 0;

  return {
    acceptedJobIds,
    activeJobId,
    activeShiftJobId,
    shiftTaskIndex: typeof value.shiftTaskIndex === 'number' && Number.isInteger(value.shiftTaskIndex)
      ? Math.max(0, Math.min(taskLimit, value.shiftTaskIndex))
      : 0,
    jobs,
  };
}
