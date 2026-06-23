import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { Input } from '@/components/ui/Input'
import { Link } from '@/components/ui/Link'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { ROUTES } from '@/router/routes'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login({ email, password })
      navigate(ROUTES.dashboard, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Wrong email or password.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <h2 className="font-display text-xl font-semibold leading-7 text-ink-900 md:text-2xl md:leading-8">
        Welcome back
      </h2>

      {error && <InlineAlert variant="error">{error}</InlineAlert>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormField>

        <FormField label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormField>

        <Button type="submit" fullWidth loading={isSubmitting}>
          Log in
        </Button>
      </form>

      <p className="flex flex-wrap items-center justify-center gap-1 text-sm text-ink-500">
        New here?
        <Link to={ROUTES.register}>Create an account</Link>
      </p>
    </AuthLayout>
  )
}
