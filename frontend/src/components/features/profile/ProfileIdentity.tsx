import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { RolePill } from '@/components/ui/RolePill'
import { Tag } from '@/components/ui/Tag'
import { VerifiedIcon } from '@/components/ui/VerifiedIcon'
import { cn } from '@/lib/utils'

export type ProfileIdentityProps = {
  name: string
  role: string
  memberSince: string
  bio: string
  skills: string[]
  tagsLabel?: string
  avatarUrl?: string | null
  verified?: boolean
  isOwner?: boolean
  bioPlaceholder?: boolean
  onEdit?: () => void
  className?: string
}

export function ProfileIdentity({
  name,
  role,
  memberSince,
  bio,
  skills,
  tagsLabel = 'Skills',
  avatarUrl,
  verified = true,
  isOwner = false,
  bioPlaceholder = false,
  onEdit,
  className,
}: ProfileIdentityProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-ink-200 bg-white shadow-sm',
        className,
      )}
    >
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar
            src={avatarUrl}
            name={name}
            size="profile"
            className="shadow-sm ring-1 ring-ink-200"
          />

          <div className="flex min-w-0 flex-1 flex-col gap-4 text-left">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                  <h1 className="font-display text-[28px] font-bold leading-8 tracking-[-0.5px] text-ink-900 md:text-[34px] md:leading-10">
                    {name}
                  </h1>
                  {verified && <VerifiedIcon size="lg" />}
                  <RolePill role={role} />
                </div>
                <p className="text-sm leading-5 text-ink-400">
                  Member since {memberSince}
                </p>
              </div>
              {isOwner && onEdit && (
                <Button variant="secondary" size="sm" onClick={onEdit}>
                  Edit profile
                </Button>
              )}
            </div>

            <p
              className={cn(
                'max-w-[560px] text-base leading-[26px]',
                bioPlaceholder ? 'text-ink-400 italic' : 'text-ink-600',
              )}
            >
              {bio}
            </p>

            {skills.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-[1.2px] text-ink-400">
                  {tagsLabel}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <Tag key={skill}>{skill}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
