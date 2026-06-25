/** Allowed project skills — must match job board filters in the frontend. */
export const PROJECT_SKILLS = [
  'Solidity',
  'Design',
  'Frontend',
  'Writing',
  'Audit',
] as const;

export type ProjectSkill = (typeof PROJECT_SKILLS)[number];

export const isProjectSkill = (value: string): value is ProjectSkill =>
  (PROJECT_SKILLS as readonly string[]).includes(value);
