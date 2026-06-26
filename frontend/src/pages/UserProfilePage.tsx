import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Briefcase, Star } from 'lucide-react'
import { ProfileIdentity, ProfileReviewCard, StatStrip } from '@/components/features'
import { AppSection } from '@/components/layout/AppSection'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { EmptyPanel } from '@/components/ui/EmptyPanel'
import { ProfilePageSkeleton } from '@/components/ui/Skeleton'
import { SectionLabel } from '@/components/ui/Tag'
import { displayName, formatRelativeTime } from '@/lib/projectDisplay'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { getPublicProfile, getUserReviews, type PublicReview } from '@/lib/users.api'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/hooks/useAuth'
import type { PublicUserProfile } from '@/types/user'

const BIO_PLACEHOLDER =
  'No bio yet. Completed work and reviews will appear here after launch.'

function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase()
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isOwner = user?.id === id

  const [profile, setProfile] = useState<PublicUserProfile | null>(null)
  const [reviews, setReviews] = useState<PublicReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    Promise.all([getPublicProfile(id), getUserReviews(id)])
      .then(([profileData, reviewData]) => {
        if (!cancelled) {
          setProfile(profileData)
          setReviews(reviewData)
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
      <AppSection narrow className="!py-8 md:!py-12">
        <ProfilePageSkeleton />
      </AppSection>
    )
  }

  if (error || !profile) {
    return (
      <AppSection narrow className="!py-8 md:!py-12">
        <InlineAlert variant="error">{error ?? 'Profile not found'}</InlineAlert>
      </AppSection>
    )
  }

  const memberSince = new Date(profile.createdAt).getFullYear().toString()
  const bio = profile.bio?.trim() || BIO_PLACEHOLDER
  const bioPlaceholder = !profile.bio?.trim()
  const reviewCount = profile.reviewCount ?? 0
  const totalStars = profile.totalStars ?? 0
  const averageRating = profile.averageRating ?? 0

  const statCells = [
    { id: 'completed', label: 'Completed projects', value: '0' },
    {
      id: 'reviews',
      label: 'Reviews received',
      value: String(reviewCount),
      highlight: reviewCount > 0,
      tone: 'brand' as const,
    },
    {
      id: 'stars',
      label: 'Stars earned',
      value: String(totalStars),
      highlight: totalStars > 0,
      tone: 'amber' as const,
    },
    {
      id: 'rating',
      label: 'Average rating',
      value: reviewCount > 0 ? averageRating.toFixed(1) : '—',
      highlight: reviewCount > 0,
      tone: 'amber' as const,
    },
  ]

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

        <StatStrip align="start" cells={statCells} />

        <section className="flex flex-col gap-3 text-left">
          <SectionLabel>Recent work</SectionLabel>
          <EmptyPanel
            icon={Briefcase}
            title="No completed projects yet"
            message="Finished work will show up here once milestones are paid out."
          />
        </section>

        <section className="flex flex-col gap-3 text-left">
          <SectionLabel>Reviews</SectionLabel>
          {reviews.length > 0 ? (
            <div className="flex flex-col gap-3">
              {reviews.map((review) => (
                <ProfileReviewCard
                  key={review.id}
                  rating={review.rating}
                  author={displayName(review.author)}
                  timeAgo={formatRelativeTime(review.createdAt)}
                  text={
                    review.comment?.trim() ||
                    `Review for ${review.project.title}`
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyPanel
              icon={Star}
              title="No reviews yet"
              message="Great work earns great feedback — reviews appear after completed projects."
            />
          )}
        </section>
      </div>
    </AppSection>
  )
}
