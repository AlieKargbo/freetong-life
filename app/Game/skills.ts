import type { NeedAction } from './needActions';

export const SKILL_NAMES = ['cooking', 'fitness', 'music', 'social', 'hustle'] as const;
export type SkillName = (typeof SKILL_NAMES)[number];
export type SkillXp = Record<SkillName, number>;

export const INITIAL_SKILL_XP: SkillXp = {
  cooking: 0,
  fitness: 0,
  music: 0,
  social: 0,
  hustle: 0,
};

export const SKILL_LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250];

export const SKILL_INFO: Record<SkillName, {
  label: string;
  emoji: string;
  source: string;
  unlock: string;
}> = {
  cooking: { label: 'Cooking', emoji: '🍲', source: 'Buy meals at Fish Grill', unlock: 'Level 2: meals restore 10 extra hunger.' },
  fitness: { label: 'Fitness', emoji: '💪', source: 'Dance at a stage', unlock: 'Level 2: dancing uses 5 less energy.' },
  music: { label: 'Music', emoji: '🎵', source: 'Dance at a stage', unlock: 'Level 2: dancing restores 8 extra fun.' },
  social: { label: 'Social', emoji: '🗣️', source: 'Chat with another player', unlock: 'Level 2: conversations restore 8 extra social.' },
  hustle: { label: 'Hustle', emoji: '💼', source: 'Complete career shift tasks', unlock: 'Level 2: earn 10% more from career shifts.' },
};

export const ACTION_SKILL_XP: Partial<Record<NeedAction, Partial<SkillXp>>> = {
  eat: { cooking: 30 },
  snack: { cooking: 15 },
  dance: { fitness: 20, music: 30 },
  play_sport: { fitness: 25, social: 20 },
  chat: { social: 20 },
};

export function skillLevelForXp(xp: number): number {
  let level = 0;
  for (let next = 1; next < SKILL_LEVEL_THRESHOLDS.length; next += 1) {
    if (xp < SKILL_LEVEL_THRESHOLDS[next]) break;
    level = next;
  }
  return level;
}

export function skillXpForNextLevel(xp: number): { current: number; needed: number; level: number } {
  const level = skillLevelForXp(xp);
  if (level >= 10) return { current: 0, needed: 0, level };
  return {
    current: xp - SKILL_LEVEL_THRESHOLDS[level],
    needed: SKILL_LEVEL_THRESHOLDS[level + 1] - SKILL_LEVEL_THRESHOLDS[level],
    level,
  };
}

export function sanitizeSkillXp(value: Partial<SkillXp>): SkillXp {
  return Object.fromEntries(SKILL_NAMES.map((skill) => [
    skill,
    Number.isFinite(value[skill]) ? Math.max(0, value[skill] ?? 0) : 0,
  ])) as SkillXp;
}
