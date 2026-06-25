import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Briefcase, Star } from 'lucide-react'
import { ProfileIdentity, StatStrip } from '@/components/features'
import { AppSection } from '@/components/layout/AppSection'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { SectionLabel } from '@/components/ui/Tag'
import { displayName } from '@/lib/projectDisplay'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { getPublicProfile } from '@/lib/users.api'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/hooks/useAuth'
import type { PublicUserProfile } from '@/types/user'

const BIO_PLACEHOLDER =
  'No bio yet. Completed work and reviews will appear here after launch.'

function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase()
}

function EmptySection({
  icon: Icon,
  message,
}: {
  icon: typeof Briefcase
  message: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-dashed border-ink-200 bg-ink-50/60 px-5 py-6">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-ink-100">
        <Icon className="size-4 text-ink-400" aria-hidden />
      </div>
      <p className="pt-1.5 text-sm leading-5 text-ink-500">{message}</p>
    </div>
  )
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isOwner = user?.id === id

  const [profile, setProfile] = useState<PublicUserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    getPublicProfile(id)
      .then((data) => {
        if (!cancelled) {
          setProfile(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Profile not found'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <AppSection narrow className="!py-12 md:!py-16">
        <p className="text-sm text-ink-500">Loading profile…</p>
      </AppSection>
    )
  }

  if (error || !profile) {
    return (
      <AppSection narrow className="!py-12 md:!py-16">
        <InlineAlert variant="error">{error ?? 'Profile not found'}</InlineAlert>
      </AppSection>
    )
  }

  const memberSince = new Date(profile.createdAt).getFullYear().toString()
  const bio = profile.bio?.trim() || BIO_PLACEHOLDER
  const bioPlaceholder = !profile.bio?.trim()

  return (
    <AppSection narrow className="!py-8 md:!py-12">
      <div className="flex flex-col gap-8">
        <ProfileIdentity
          name={displayName(profile)}
          role={formatRole(profile.role)}
          memberSince={memberSince}
          bio={bio}
          bioPlaceholder={bioPlaceholder}
          skills={profile.skills}
          avatarUrl={profile.avatarUrl}
          verified={profile.isVerified}
          isOwner={isOwner}
          onEdit={isOwner ? () => navigate(ROUTES.settings) : undefined}
        />

        <StatStrip
          align="start"
          cells={[
            { id: 'completed', label: 'Completed projects', value: '0' },
            { id: 'reviews', label: 'Reviews received', value: '0' },
            { id: 'member', label: 'Member since', value: memberSince },
          ]}
        />

        <section className="flex flex-col gap-3">
          <SectionLabel>Recent work</SectionLabel>
          <EmptySection
            icon={Briefcase}
            message="No completed projects yet. Finished work will show up here."
          />
        </section>

        <section className="flex flex-col gap-3">
          <SectionLabel>Reviews</SectionLabel>
          <EmptySection
            icon={Star}
            message="No reviews yet. Great work earns great feedback."
          />
        </section>
      </div>
    </AppSection>
  )
}
