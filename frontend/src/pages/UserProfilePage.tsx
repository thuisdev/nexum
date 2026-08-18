import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Briefcase, Star } from 'lucide-react'
import { ProfileIdentity, ProfileReviewCard, StatStrip } from '@/components/features'
import { AppSection } from '@/components/layout/AppSection'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { EmptyPanel } from '@/components/ui/EmptyPanel'
import { ProfilePageSkeleton } from '@/components/ui/Skeleton'
import { SectionLabel, Tag } from '@/components/ui/Tag'
import { displayName, formatRelativeTime } from '@/lib/projectDisplay'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import {
  getPublicProfile,
  getUserCompletedProjects,
  getUserReviews,
  type PublicCompletedProject,
  type PublicReview,
} from '@/lib/users.api'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/hooks/useAuth'
import type { PublicUserProfile } from '@/types/user'

const BIO_PLACEHOLDER_FREELANCER =
  'No bio yet. Completed work and reviews will appear here after launch.'

const BIO_PLACEHOLDER_CLIENT =
  'No bio yet. Add a short intro about your organization in profile settings.'

function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase()
}

function formatCompletedDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  })
}

function CompletedProjectCard({
  project,
  onOpen,
}: {
  project: PublicCompletedProject
  onOpen: () => void
}) {
  const completedLabel = formatCompletedDate(project.completedAt)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-3 rounded-2xl border border-ink-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50/30"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-display text-base font-semibold text-ink-900">
          {project.title}
        </p>
        {completedLabel && (
          <span className="text-xs font-medium text-ink-400">{completedLabel}</span>
        )}
      </div>
      {project.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.skills.map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </div>
      )}
      <p className="font-mono text-sm font-medium text-ink-700">
        {Number(project.totalBudget).toLocaleString()} {project.currency}
      </p>
    </button>
  )
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isOwner = user?.id === id

  const [profile, setProfile] = useState<PublicUserProfile | null>(null)
  const [reviews, setReviews] = useState<PublicReview[]>([])
  const [completedProjects, setCompletedProjects] = useState<
    PublicCompletedProject[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    Promise.all([
      getPublicProfile(id),
      getUserReviews(id),
      getUserCompletedProjects(id),
    ])
      .then(([profileData, reviewData, completedData]) => {
        if (!cancelled) {
          setProfile(profileData)
          setReviews(reviewData)
          setCompletedProjects(completedData)
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
  const isClient = profile.role === 'CLIENT'
  const bio =
    profile.bio?.trim() ||
    (isClient ? BIO_PLACEHOLDER_CLIENT : BIO_PLACEHOLDER_FREELANCER)
  const bioPlaceholder = !profile.bio?.trim()
  const reviewCount = profile.reviewCount ?? 0
  const totalStars = profile.totalStars ?? 0
  const averageRating = profile.averageRating ?? 0
  const completedProjectCount = profile.completedProjectCount ?? 0
  const workSectionLabel = isClient ? 'Projects posted' : 'Recent work'

  const statCells = [
    {
      id: 'completed',
      label: 'Completed projects',
      value: String(completedProjectCount),
      highlight: completedProjectCount > 0,
      tone: 'brand' as const,
    },
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
          tagsLabel={isClient ? 'Industries' : 'Skills'}
          avatarUrl={profile.avatarUrl}
          verified={profile.isVerified}
          isOwner={isOwner}
          onEdit={isOwner ? () => navigate(ROUTES.settings) : undefined}
        />

        <StatStrip align="start" cells={statCells} />

        <section className="flex flex-col gap-3 text-left">
          <SectionLabel>{workSectionLabel}</SectionLabel>
          {completedProjects.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {completedProjects.map((project) => (
                <CompletedProjectCard
                  key={project.id}
                  project={project}
                  onOpen={() => navigate(ROUTES.project(project.id))}
                />
              ))}
            </div>
          ) : (
            <EmptyPanel
              icon={Briefcase}
              title="No completed projects yet"
              message={
                isClient
                  ? 'Finished projects you funded will show up here once milestones are paid out.'
                  : 'Finished work will show up here once milestones are paid out.'
              }
            />
          )}
        </section>

        <section className="flex flex-col gap-3 text-left">
          <SectionLabel>Reviews</SectionLabel>
          {reviews.length > 0 ? (
            <div className="flex flex-col gap-3">
              {reviews.map((review) => (
                <ProfileReviewCard
                  key={review.id}
                  rating={review.rating}
                  authorId={review.author.id}
                  author={displayName(review.author)}
                  authorAvatarUrl={review.author.avatarUrl}
                  authorAvatarColor={review.author.avatarColor}
                  timeAgo={formatRelativeTime(review.createdAt)}
                  text={
                    review.comment?.trim() ||
                    (review.project.title
                      ? `Review for ${review.project.title}`
                      : 'Review after a completed project')
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
