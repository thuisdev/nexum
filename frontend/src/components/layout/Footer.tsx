import { Link } from 'react-router-dom'
import { ROUTES } from '@/router/routes'

const productLinks = ['Job board', 'How it works', 'Pricing']
const companyLinks = ['About', 'Blog', 'Careers']
const legalLinks = ['Terms', 'Privacy']

function LinkColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <p className="text-sm font-medium leading-5 text-ink-900">{title}</p>
      {links.map((link) => (
        <span
          key={link}
          className="text-sm leading-5 text-ink-500"
        >
          {link}
        </span>
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
              Pactum
            </Link>
            <p className="max-w-[260px] text-sm leading-5 text-ink-500">
              Milestone escrow for freelancers and clients. Ship work, release
              payment, build trust.
            </p>
          </div>

          <div className="flex flex-col gap-7 md:flex-row md:flex-[3] md:gap-8">
            <LinkColumn title="Product" links={productLinks} />
            <LinkColumn title="Company" links={companyLinks} />
            <LinkColumn title="Legal" links={legalLinks} />
          </div>
        </div>

        <p className="text-center text-xs leading-4 text-ink-400">
          Pactum · 2026 · Built as Metana M12 capstone
        </p>
      </div>
    </footer>
  )
}
