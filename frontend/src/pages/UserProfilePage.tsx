import { useNavigate, useParams } from 'react-router-dom'
import {
  ProfileIdentity,
  ProfileReviewCard,
  StatStrip,
  WorkList,
} from '@/components/features'
import { SectionLabel } from '@/components/ui/Tag'
import { PROFILE_REVIEWS, PROFILE_STATS, PROFILE_WORK } from '@/lib/mockData'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/hooks/useAuth'

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isOwner = user?.id === id

  return (
    <section className="flex w-full flex-col items-center px-4 py-12 md:px-8 md:py-16">
      <div className="flex w-full max-w-[720px] flex-col gap-6">
        <ProfileIdentity
          name="bob.eth"
          role="Freelancer"
          memberSince="2026"
          bio="Full-stack & Solidity developer. Pseudonymous — payment via escrow only. I ship milestone by milestone and don't disappear."
          skills={['Solidity', 'React', 'Foundry', 'TypeScript']}
          verified
          isOwner={isOwner}
          onEdit={() => navigate(ROUTES.settings)}
        />

        <StatStrip cells={PROFILE_STATS} />

        <div className="flex flex-col gap-3">
          <SectionLabel>Recent work</SectionLabel>
          <WorkList items={PROFILE_WORK} />
        </div>

        <div className="flex flex-col gap-3">
          <SectionLabel>Reviews</SectionLabel>
          <div className="flex flex-col gap-3">
            {PROFILE_REVIEWS.map((r) => (
              <ProfileReviewCard key={r.id} {...r} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
