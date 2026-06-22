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
  avatarUrl?: string | null
  verified?: boolean
  isOwner?: boolean
  onEdit?: () => void
  className?: string
}

export function ProfileIdentity({
  name,
  role,
  memberSince,
  bio,
  skills,
  avatarUrl,
  verified = true,
  isOwner = false,
  onEdit,
  className,
}: ProfileIdentityProps) {
  return (
    <div className={cn('flex w-full flex-col items-center', className)}>
      {isOwner && onEdit && (
        <div className="mb-6 flex w-full justify-end">
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Edit profile
          </Button>
        </div>
      )}

      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar src={avatarUrl} name={name} size="hero" />
        <div className="flex flex-wrap items-center justify-center gap-2">
          <h2 className="font-display text-[30px] font-bold leading-9 text-ink-900 md:text-[36px] md:leading-10">
            {name}
          </h2>
          {verified && <VerifiedIcon size="lg" />}
          <RolePill role={role} />
        </div>
        <p className="text-sm leading-5 text-ink-500">Member since {memberSince}</p>
        <p className="max-w-[520px] text-base leading-6 text-ink-500">{bio}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {skills.map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </div>
      </div>
    </div>
  )
}
