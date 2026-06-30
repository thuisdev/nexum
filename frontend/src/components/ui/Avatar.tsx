import { cn } from '@/lib/utils'
import {
  AVATAR_COLOR_CLASSES,
  type AvatarColor,
} from '@/lib/avatarColors'
import { uploadFileUrl } from '@/lib/projectDisplay'

const sizeClasses = {
  sm: 'size-6 text-[10px]',
  nav: 'size-7 text-xs',
  md: 'size-10 text-sm',
  settings: 'size-16 text-lg',
  hero: 'size-24 text-2xl',
  profile: 'size-32 text-3xl',
} as const

export type AvatarSize = keyof typeof sizeClasses

export type AvatarProps = {
  src?: string | null
  alt?: string
  name?: string | null
  color?: string | null
  size?: AvatarSize
  className?: string
}

function getInitials(name?: string | null): string {
  if (!name?.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
}

export function Avatar({
  src,
  alt,
  name,
  color,
  size = 'md',
  className,
}: AvatarProps) {
  const label = alt ?? name ?? 'User'
  const resolvedSrc = src?.startsWith('/uploads/') ? uploadFileUrl(src) : src

  if (resolvedSrc) {
    return (
      <img
        src={resolvedSrc}
        alt={label}
        className={cn(
          'shrink-0 rounded-full object-cover bg-ink-100',
          sizeClasses[size],
          className,
        )}
      />
    )
  }

  const colorClass =
    color && color in AVATAR_COLOR_CLASSES
      ? AVATAR_COLOR_CLASSES[color as AvatarColor]
      : 'bg-ink-100 text-ink-600'

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium',
        colorClass,
        sizeClasses[size],
        className,
      )}
      aria-hidden={!name}
    >
      {getInitials(name)}
    </span>
  )
}
