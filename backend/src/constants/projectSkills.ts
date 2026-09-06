/** Allowed project skills — must match job board filters in the frontend. */
export const PROJECT_SKILLS = [
  'Solidity',
  'Frontend',
  'Backend',
  'Design',
  'Audit',
  'Writing',
  'DevOps',
  'Product',
  'Research',
  'Marketing',
] as const;

export type ProjectSkill = (typeof PROJECT_SKILLS)[number];

export const MAX_PROJECT_SKILLS = 4;

export const isProjectSkill = (value: string): value is ProjectSkill =>
  (PROJECT_SKILLS as readonly string[]).includes(value);
