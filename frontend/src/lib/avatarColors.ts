export const AVATAR_COLORS = [
  'brand',
  'violet',
  'emerald',
  'amber',
  'rose',
  'sky',
  'ink',
] as const

export type AvatarColor = (typeof AVATAR_COLORS)[number]

export const AVATAR_COLOR_CLASSES: Record<AvatarColor, string> = {
  brand: 'bg-brand-100 text-brand-700',
  violet: 'bg-violet-100 text-violet-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
  sky: 'bg-sky-100 text-sky-700',
  ink: 'bg-ink-100 text-ink-600',
}
