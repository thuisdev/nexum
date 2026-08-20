import { Link } from 'react-router-dom'
import { ROUTES } from '@/router/routes'

type FooterLink = {
  label: string
  to: string
}

const productLinks: FooterLink[] = [
  { label: 'Job board', to: ROUTES.jobs },
  { label: 'How it works', to: ROUTES.howItWorks },
  { label: 'Pricing', to: ROUTES.pricing },
]

const companyLinks: FooterLink[] = [
  { label: 'About', to: ROUTES.about },
  { label: 'Blog', to: ROUTES.blog },
  { label: 'Careers', to: ROUTES.careers },
]

const legalLinks: FooterLink[] = [
  { label: 'Terms', to: ROUTES.terms },
  { label: 'Privacy', to: ROUTES.privacy },
]

function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <p className="text-sm font-medium leading-5 text-ink-900">{title}</p>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="text-sm leading-5 text-ink-500 transition-colors hover:text-brand-600"
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="w-full border-t border-ink-200">
      <div className="mx-auto flex max-w-[1152px] flex-col gap-9 px-4 py-12 md:px-8 lg:px-8">
        <div className="flex flex-col gap-7 lg:flex-row lg:gap-8">
          <div className="flex w-full max-w-[360px] flex-col gap-2 lg:shrink-0">
            <Link
              to={ROUTES.home}
              className="font-display text-xl font-bold text-ink-900"
            >
              Nexum
            </Link>
            <p className="max-w-[280px] text-sm leading-5 text-ink-500">
              Parties who don't trust each other can still work together securely.
            </p>
          </div>

          <div className="flex flex-col gap-7 md:flex-row md:flex-[3] md:gap-8">
            <LinkColumn title="Product" links={productLinks} />
            <LinkColumn title="Company" links={companyLinks} />
            <LinkColumn title="Legal" links={legalLinks} />
          </div>
        </div>

        <p className="text-center text-xs leading-4 text-ink-400">
          Copyright © 2026 Nexum. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
