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
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { registerSchema, type RegisterInput } from '@/lib/validation'
import { ROUTES } from '@/router/routes'

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      role: 'CLIENT',
    },
  })

  const onSubmit = async (data: RegisterInput) => {
    setError(null)
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        role: data.role,
        ...(data.name?.trim() && { name: data.name.trim() }),
      })
      navigate(ROUTES.dashboard, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Email already in use.'))
    }
  }

  return (
    <AuthLayout>
      <h2 className="font-display text-xl font-semibold leading-7 text-ink-900 md:text-2xl md:leading-8">
        Create your account
      </h2>

      {error && <InlineAlert variant="error">{error}</InlineAlert>}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <FormField label="I am a…" htmlFor="role">
          <Select id="role" {...register('role')}>
            <option value="CLIENT">Client (I want to hire)</option>
            <option value="FREELANCER">Freelancer (I want to work)</option>
          </Select>
        </FormField>

        <FormField label="Name" htmlFor="name">
          <Input
            id="name"
            placeholder="Your name"
            {...register('name')}
          />
        </FormField>

        <FormField
          label="Email"
          htmlFor="email"
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            error={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          helper={errors.password ? undefined : 'At least 8 characters'}
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={!!errors.password}
            {...register('password')}
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
