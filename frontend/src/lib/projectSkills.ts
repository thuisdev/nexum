/** Allowed project skills — must match job board filter chips (except "All"). */
export const PROJECT_SKILLS = [
  'Solidity',
  'Design',
  'Frontend',
  'Writing',
  'Audit',
] as const

export type ProjectSkill = (typeof PROJECT_SKILLS)[number]

export const MAX_PROJECT_SKILLS = 4

export const JOB_BOARD_FILTER_CHIPS = ['All', ...PROJECT_SKILLS] as const
