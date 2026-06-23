import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { Input } from '@/components/ui/Input'
import { Link } from '@/components/ui/Link'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { loginSchema, type LoginInput } from '@/lib/validation'
import { ROUTES } from '@/router/routes'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginInput) => {
    setError(null)
    try {
      await login(data)
      navigate(ROUTES.dashboard, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Wrong email or password.'))
    }
  }

  return (
    <AuthLayout>
      <h2 className="font-display text-xl font-semibold leading-7 text-ink-900 md:text-2xl md:leading-8">
        Welcome back
      </h2>

      {error && <InlineAlert variant="error">{error}</InlineAlert>}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <FormField
          label="Email"
          htmlFor="email"
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            error={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            error={!!errors.password}
            {...register('password')}
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
