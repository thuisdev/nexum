import { useLocation, useNavigate } from 'react-router-dom'
import { Construction } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyPanel } from '@/components/ui/EmptyPanel'
import { AppSection } from '@/components/layout/AppSection'
import { ROUTES } from '@/router/routes'

const PAGE_COPY: Record<string, { title: string; description: string }> = {
  [ROUTES.howItWorks]: {
    title: 'How it works',
    description:
      'A dedicated walkthrough of milestone escrow, funding, and payouts is coming soon.',
  },
  [ROUTES.pricing]: {
    title: 'Pricing',
    description:
      'Transparent fee structure and plan details will be published here soon.',
  },
  [ROUTES.about]: {
    title: 'About',
    description:
      'Our story, mission, and team will live on this page — check back soon.',
  },
  [ROUTES.blog]: {
    title: 'Blog',
    description:
      'Product updates, guides, and marketplace insights are on the way.',
  },
  [ROUTES.careers]: {
    title: 'Careers',
    description:
      'Open roles and how we work will be listed here when we start hiring.',
  },
  [ROUTES.terms]: {
    title: 'Terms of service',
    description:
      'Legal terms for using Nexum will be published here before public launch.',
  },
  [ROUTES.privacy]: {
    title: 'Privacy policy',
    description:
      'How we handle your data and privacy will be documented here soon.',
  },
}

export default function ComingSoonPage() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const copy = PAGE_COPY[pathname] ?? {
    title: 'Coming soon',
    description: 'This page is not available yet.',
  }

  return (
    <AppSection narrow className="!py-16 md:!py-24">
      <EmptyPanel
        icon={Construction}
        title={copy.title}
        message={copy.description}
        action={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={() => navigate(ROUTES.home)}>Back home</Button>
            <Button variant="ghost" onClick={() => navigate(ROUTES.jobs)}>
              Browse jobs
            </Button>
          </div>
        }
      />
    </AppSection>
  )
}
