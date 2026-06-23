import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Eyebrow, Trustline } from '@/components/ui/Trustline'
import { AppSection } from '@/components/layout/AppSection'
import {
  AudienceCard,
  CtaBand,
  HeroPanel,
  LandingTrustStrip,
  ReviewCard,
  StepCard,
} from '@/components/features'
import { ROUTES } from '@/router/routes'

const HERO_MILESTONES = [
  { id: '1', title: 'Wireframes', amount: '200', status: 'paid' as const },
  { id: '2', title: 'Visual design', amount: '300', status: 'approve' as const },
  { id: '3', title: 'Final delivery', amount: '300', status: 'in_progress' as const },
]

const TRUST_STATS = [
  { id: '1', value: '312,400', label: 'USDC in escrow', highlight: true },
  { id: '2', value: '47', label: 'open projects' },
  { id: '3', value: '100%', label: 'milestone-protected' },
  { id: '4', value: '0%', label: 'ghosting' },
]

const STEPS = [
  {
    step: 1,
    title: 'Fund the project',
    description:
      'Client locks the full budget in escrow before work begins. Freelancers see funds are real.',
  },
  {
    step: 2,
    title: 'Ship milestone by milestone',
    description:
      'Work happens in clear steps with deadlines. Submit deliverables, get reviewed, move on.',
  },
  {
    step: 3,
    title: 'Release on approval',
    description:
      'Client approves each milestone. Payment releases instantly — no chasing invoices.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  const goStart = () =>
    navigate(isLoggedIn ? ROUTES.dashboard : ROUTES.register)
  const goJobs = () => navigate(ROUTES.jobs)

  return (
    <>
      {/* Hero */}
      <section className="w-full px-4 pb-14 pt-[72px] md:px-8 md:pb-14 md:pt-[72px]">
        <div className="mx-auto flex max-w-[1152px] flex-col items-center gap-9 lg:flex-row lg:items-center lg:gap-14">
          <div className="flex w-full flex-col gap-[18px] lg:flex-1">
            <h1 className="font-display text-[36px] font-bold leading-10 tracking-[-1px] text-ink-900 md:text-[46px] md:leading-[48px]">
              Get paid for crypto work — without the trust problem.
            </h1>
            <p className="max-w-[480px] text-lg leading-[26px] text-ink-500">
              Pactum locks the budget in{' '}
              <span className="font-medium text-ink-900">escrow</span> before work
              starts and releases it{' '}
              <span className="font-medium text-ink-900">milestone by milestone</span>.
              No 20% fees. No ghosting.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Button size="lg" fullWidth className="sm:w-auto" onClick={goStart}>
                Get started
              </Button>
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                className="sm:w-auto"
                onClick={goJobs}
              >
                Browse jobs
              </Button>
            </div>
            <Trustline text="312,400 USDC currently in escrow" />
          </div>
          <div className="w-full lg:flex-1">
            <HeroPanel escrowAmount="800 USDC" milestones={HERO_MILESTONES} />
          </div>
        </div>
      </section>

      <LandingTrustStrip stats={TRUST_STATS} />

      {/* How it works */}
      <AppSection marketing className="!py-12 md:!py-[72px]">
        <div className="flex flex-col items-center gap-11 text-center">
          <div className="flex flex-col items-center gap-2">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="font-display text-2xl font-semibold leading-9 text-ink-900 md:text-[30px] md:leading-9">
              Three steps, zero trust required
            </h2>
            <p className="max-w-[520px] text-sm leading-5 text-ink-500">
              Milestone escrow protects both sides from day one — no payment
              surprises, no disappearing clients.
            </p>
          </div>
          <div className="grid w-full gap-6 md:grid-cols-3 md:gap-6">
            {STEPS.map((s) => (
              <StepCard key={s.step} {...s} />
            ))}
          </div>
        </div>
      </AppSection>

      {/* Audiences */}
      <AppSection marketing className="bg-ink-50 !py-12 md:!py-[72px]">
        <div className="grid w-full gap-6 md:grid-cols-2 md:gap-6">
          <AudienceCard
            eyebrow="For clients"
            title="Pay only for approved work."
            items={[
              'Lock budget in escrow before work starts',
              'Review each milestone before release',
              'Invite freelancers or post publicly',
            ]}
            ctaLabel="Post a project"
            onCta={() => navigate(ROUTES.register)}
          />
          <AudienceCard
            eyebrow="For freelancers"
            title="Never get ghosted again."
            items={[
              'See escrow-backed projects only',
              'Submit work milestone by milestone',
              'Get paid on approval — every time',
            ]}
            ctaLabel="Find work"
            ctaVariant="ghost"
            onCta={goJobs}
          />
        </div>
      </AppSection>

      {/* Reviews */}
      <AppSection marketing className="!py-12 md:!py-[72px]">
        <div className="flex flex-col items-center gap-11">
          <div className="flex flex-col items-center gap-2 text-center">
            <Eyebrow>Trusted by both sides</Eyebrow>
            <h2 className="font-display text-2xl font-semibold leading-9 text-ink-900 md:text-[30px]">
              Real reviews, after real work
            </h2>
            <p className="max-w-[520px] text-sm text-ink-500">
              Reviews unlock only after a project completes — no fakes.
            </p>
          </div>
          <div className="grid w-full gap-6 md:grid-cols-2">
            <ReviewCard
              quote="Delivered every milestone early. Escrow made the whole process stress-free."
              authorName="bob.eth"
              authorRole="Freelancer"
            />
            <ReviewCard
              quote="Finally a platform where I only pay for work I approve. Will use again."
              authorName="alice.eth"
              authorRole="Client"
            />
          </div>
        </div>
      </AppSection>

      {/* CTA */}
      <section className="w-full px-4 pb-[72px] pt-0 md:px-8">
        <div className="mx-auto max-w-[1152px]">
          <CtaBand
            title="Ready to work without the trust problem?"
            description="Post a project or find your next gig — funds protected from day one."
            primaryLabel="Get started"
            secondaryLabel="Browse jobs"
            onPrimary={goStart}
            onSecondary={goJobs}
          />
        </div>
      </section>
    </>
  )
}
