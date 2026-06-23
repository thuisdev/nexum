import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/router/routes'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <section className="flex w-full flex-col items-center px-4 py-24 md:py-24">
      <div className="flex max-w-[420px] flex-col items-center gap-4 text-center">
        <p className="font-display text-[56px] font-bold leading-[60px] text-ink-900 md:text-[72px] md:leading-[76px]">
          404
        </p>
        <h1 className="font-display text-lg font-semibold leading-7 text-ink-900 md:text-xl">
          Page not found
        </h1>
        <p className="text-base leading-6 text-ink-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button size="lg" fullWidth className="md:w-auto" onClick={() => navigate(ROUTES.home)}>
          Back home
        </Button>
      </div>
    </section>
  )
}
