import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { Input } from '@/components/ui/Input'
import { Link } from '@/components/ui/Link'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { ROUTES } from '@/router/routes'

type RegisterRole = 'CLIENT' | 'FREELANCER'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<RegisterRole>('CLIENT')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await register({
        email,
        password,
        role,
        ...(name.trim() && { name: name.trim() }),
      })
      navigate(ROUTES.dashboard, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Email already in use.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <h2 className="font-display text-xl font-semibold leading-7 text-ink-900 md:text-2xl md:leading-8">
        Create your account
      </h2>

      {error && <InlineAlert variant="error">{error}</InlineAlert>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="I am a…" htmlFor="role">
          <Select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as RegisterRole)}
          >
            <option value="CLIENT">Client (I want to hire)</option>
            <option value="FREELANCER">Freelancer (I want to work)</option>
          </Select>
        </FormField>

        <FormField label="Name" htmlFor="name">
          <Input
            id="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormField>

        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          helper="At least 8 characters"
        >
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormField>

        <Button type="submit" fullWidth loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="flex flex-wrap items-center justify-center gap-1 text-sm text-ink-500">
        Already have an account?
        <Link to={ROUTES.login}>Log in</Link>
      </p>
    </AuthLayout>
  )
}
