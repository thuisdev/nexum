import { useLoaderData, useNavigate } from 'react-router-dom'
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
import { formatUsdcStat } from '@/lib/stats.api'
import { type LandingLoaderData } from '@/router/landingLoader'

const HERO_MILESTONES = [
  { id: '1', title: 'Wireframes', amount: '200', status: 'pending' as const },
  { id: '2', title: 'Visual design', amount: '300', status: 'in_progress' as const },
  { id: '3', title: 'Final delivery', amount: '300', status: 'approve' as const },
]

const TRUST_STATS_FALLBACK = [
  { id: '1', value: '—', label: 'USDC in escrow', highlight: true },
  { id: '2', value: '—', label: 'open projects' },
  { id: '3', value: '100%', label: 'milestone-protected' },
  { id: '4', value: '0%', label: 'ghosting' },
]

const EXPLAINER_POINTS = [
  {
    title: 'What it is',
    description: 'A crypto freelance marketplace where clients hire and freelancers get paid through milestone escrow.',
  },
  {
    title: 'Who it is for',
    description: 'Clients who want safer remote hiring, and freelancers who want proof the budget is real before they start.',
  },
  {
    title: 'Why it is different',
    description: 'Money is locked before work begins and released milestone by milestone instead of relying on trust or chasing invoices.',
  },
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
  const { stats } = useLoaderData() as LandingLoaderData

  const trustStats = stats
    ? [
        {
          id: '1',
          value: formatUsdcStat(stats.usdcInEscrow),
          label: 'USDC in escrow',
          highlight: true,
        },
        { id: '2', value: String(stats.openProjects), label: 'open projects' },
        { id: '3', value: '100%', label: 'milestone-protected' },
        { id: '4', value: '0%', label: 'ghosting' },
      ]
    : TRUST_STATS_FALLBACK

  const escrowTrustline = stats
    ? `${formatUsdcStat(stats.usdcInEscrow)} USDC currently in escrow`
    : 'USDC held in escrow before work starts'

  const goStart = () =>
    navigate(isLoggedIn ? ROUTES.dashboard : ROUTES.register)
  const goJobs = () => navigate(ROUTES.jobs)

  return (
    <>
      {/* Hero */}
      <section className="w-full bg-[radial-gradient(circle_at_top_left,_rgba(24,119,242,0.08),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.08),_transparent_30%)] px-4 pb-16 pt-[72px] md:px-8 md:pb-20 md:pt-[84px]">
        <div className="mx-auto flex max-w-[1152px] flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex w-full flex-col gap-5 lg:flex-1">
            <Eyebrow className="text-brand-600">Crypto freelance marketplace with escrow</Eyebrow>
            <h1 className="max-w-[640px] font-display text-[38px] font-bold leading-[1.02] tracking-[-1.2px] text-ink-900 md:text-[54px] md:leading-[54px]">
              Nexum is where clients hire crypto freelancers without the usual trust risk.
            </h1>
            <p className="max-w-[560px] text-lg leading-7 text-ink-600">
              Clients post a project, fund it upfront, and release payment only when
              milestones are approved. Freelancers can see the budget is locked before
              they start.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Button size="lg" fullWidth className="sm:w-auto" onClick={goStart}>
                Post a project
              </Button>
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                className="sm:w-auto"
                onClick={goJobs}
              >
                Browse freelance jobs
              </Button>
            </div>
            <Trustline text={escrowTrustline} className="pt-1" />
          </div>
          <div className="w-full lg:flex-1">
            <HeroPanel
              className="border-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.10)]"
              escrowAmount="800 USDC"
              milestones={HERO_MILESTONES}
            />
          </div>
        </div>
      </section>

      <LandingTrustStrip stats={trustStats} />

      <AppSection marketing className="!py-10 md:!py-12">
        <div className="flex flex-col gap-5">
          <div className="max-w-[720px]">
            <Eyebrow>Product overview</Eyebrow>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-9 text-ink-900 md:text-[30px] md:leading-9">
              What Nexum actually does
            </h2>
            <p className="mt-2 max-w-[680px] text-sm leading-6 text-ink-500">
              Parties who don't trust each other can still work together securely.
              The budget is locked before work starts and released only when each
              milestone is approved.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {EXPLAINER_POINTS.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-[1.4px] text-brand-600">
                  {point.title}
                </p>
                <p className="mt-3 text-sm leading-6 text-ink-600">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </AppSection>

      {/* How it works */}
      <AppSection marketing className="!py-12 md:!py-[72px]">
        <div className="flex flex-col items-center gap-11 text-center">
          <div className="flex flex-col items-center gap-2">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="font-display text-2xl font-semibold leading-9 text-ink-900 md:text-[30px] md:leading-9">
              How a project runs on Nexum
            </h2>
            <p className="max-w-[520px] text-sm leading-5 text-ink-500">
              The client funds the project first, the freelancer ships milestone by milestone,
              and each approved milestone releases payment.
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
            title="Hire a crypto freelancer without paying on blind trust."
            items={[
              'Lock budget in escrow before work starts',
              'Review each milestone before release',
              'Invite freelancers or post publicly',
            ]}
            ctaLabel="Post a project"
            onCta={goStart}
          />
          <AudienceCard
            eyebrow="For freelancers"
            title="Take on crypto work knowing the money is already there."
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
