import { Link } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { useAuth } from '@/hooks/useAuth';

const LandingPage = () => {
  const { isLoggedIn } = useAuth();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center gap-10 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          Web3 freelance · milestone escrow
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Hire and get paid with confidence.
        </h1>
        <p className="text-lg leading-relaxed text-zinc-600">
          Pactum connects clients and freelancers with milestone-based work and
          escrow-style payments. Ship deliverables, approve milestones, build
          reputation — without the trust gap.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {isLoggedIn ? (
          <Link
            to={ROUTES.dashboard}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link
              to={ROUTES.register}
              className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Create account
            </Link>
            <Link
              to={ROUTES.login}
              className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Sign in
            </Link>
          </>
        )}
        <Link
          to={ROUTES.jobs}
          className="rounded-lg px-5 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          Browse jobs →
        </Link>
      </div>

      <ul className="grid gap-4 border-t border-zinc-200 pt-8 sm:grid-cols-3">
        <li className="space-y-1">
          <h2 className="font-semibold text-zinc-900">Milestones</h2>
          <p className="text-sm text-zinc-600">
            Break work into clear steps with deadlines and payouts.
          </p>
        </li>
        <li className="space-y-1">
          <h2 className="font-semibold text-zinc-900">Escrow</h2>
          <p className="text-sm text-zinc-600">
            Funds are held until each deliverable is approved.
          </p>
        </li>
        <li className="space-y-1">
          <h2 className="font-semibold text-zinc-900">Reputation</h2>
          <p className="text-sm text-zinc-600">
            Reviews after completion — pseudonymous and portable.
          </p>
        </li>
      </ul>
    </main>
  );
};

export default LandingPage;
