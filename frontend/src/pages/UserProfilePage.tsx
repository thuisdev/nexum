import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ProfileIdentity,
  StatStrip,
} from '@/components/features'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { SectionLabel } from '@/components/ui/Tag'
import { displayName } from '@/lib/projectDisplay'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { getPublicProfile } from '@/lib/users.api'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/hooks/useAuth'
import type { PublicUserProfile } from '@/types/user'

function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase()
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

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getPublicProfile(id)
        setProfile(data)
      } catch (err) {
        setError(getApiErrorMessage(err, 'Profile not found'))
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id])

  if (loading) {
    return (
      <section className="flex w-full flex-col items-center px-4 py-12 md:px-8 md:py-16">
        <p className="text-sm text-ink-500">Loading profile…</p>
      </section>
    )
  }

  if (error || !profile) {
    return (
      <section className="flex w-full flex-col items-center px-4 py-12 md:px-8 md:py-16">
        <div className="w-full max-w-[720px]">
          <InlineAlert variant="error">{error ?? 'Profile not found'}</InlineAlert>
        </div>
      </section>
    )
  }

  const memberSince = new Date(profile.createdAt).getFullYear().toString()
  const bio =
    profile.bio?.trim() ||
    'No bio yet. Completed work and reviews will appear here after launch.'

  return (
    <section className="flex w-full flex-col items-center px-4 py-12 md:px-8 md:py-16">
      <div className="flex w-full max-w-[720px] flex-col gap-6">
        <ProfileIdentity
          name={displayName(profile)}
          role={formatRole(profile.role)}
          memberSince={memberSince}
          bio={bio}
          skills={profile.skills}
          avatarUrl={profile.avatarUrl}
          verified={profile.isVerified}
          isOwner={isOwner}
          onEdit={isOwner ? () => navigate(ROUTES.settings) : undefined}
        />

        <StatStrip
          cells={[
            { id: 'completed', label: 'Completed', value: '0' },
            { id: 'reviews', label: 'Reviews', value: '0' },
            { id: 'member', label: 'Member since', value: memberSince },
          ]}
        />

        <div className="flex flex-col gap-3">
          <SectionLabel>Recent work</SectionLabel>
          <p className="text-sm text-ink-500">No completed projects yet.</p>
        </div>

        <div className="flex flex-col gap-3">
          <SectionLabel>Reviews</SectionLabel>
          <p className="text-sm text-ink-500">No reviews yet.</p>
        </div>
      </div>
    </section>
  )
}
