import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AppSection } from '@/components/layout/AppSection'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { Input } from '@/components/ui/Input'
import { Link } from '@/components/ui/Link'
import { RolePill } from '@/components/ui/RolePill'
import { Textarea } from '@/components/ui/Textarea'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { displayName } from '@/lib/projectDisplay'
import { updateProfileSchema } from '@/lib/validation'
import { ROUTES } from '@/router/routes'
import type { User } from '@/types/user'

const settingsFormSchema = updateProfileSchema.extend({
  skillsText: z.string().optional(),
})

type SettingsFormInput = z.infer<typeof settingsFormSchema>

function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase()
}

function SettingsForm({ user }: { user: User }) {
  const navigate = useNavigate()
  const { update } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormInput>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      name: user.name ?? '',
      displayName: user.displayName ?? '',
      bio: user.bio ?? '',
      skillsText: (user.skills ?? []).join(', '),
    },
  })

  const onSubmit = async (data: SettingsFormInput) => {
    setError(null)
    try {
      const skills = (data.skillsText ?? '')
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)

      await update({
        ...(data.name?.trim() && { name: data.name.trim() }),
        ...(data.displayName?.trim() && { displayName: data.displayName.trim() }),
        bio: data.bio?.trim() ?? '',
        skills,
      })

      navigate(ROUTES.profile(user.id))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save profile'))
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-ink-200 bg-white p-6 shadow-sm">
      {error && <InlineAlert variant="error">{error}</InlineAlert>}

      <div className="flex flex-col gap-4 border-b border-ink-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={user.displayName ?? user.name} size="settings" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-ink-900">
              {displayName(user)}
            </p>
            <RolePill role={formatRole(user.role)} />
          </div>
        </div>
        <Link
          to={ROUTES.profile(user.id)}
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          View public profile →
        </Link>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <FormField label="Email" htmlFor="email">
          <Input id="email" value={user.email} disabled readOnly />
        </FormField>

        <FormField
          label="Display name"
          htmlFor="displayName"
          helper="Public — shown on your profile and project cards"
          error={errors.displayName?.message}
        >
          <Input
            id="displayName"
            placeholder="e.g. bob.eth"
            error={!!errors.displayName}
            {...register('displayName')}
          />
        </FormField>

        <FormField
          label="Legal name"
          htmlFor="name"
          helper="Optional — not shown on your public profile"
          error={errors.name?.message}
        >
          <Input
            id="name"
            placeholder="Your real name"
            error={!!errors.name}
            {...register('name')}
          />
        </FormField>

        <FormField
          label="Bio"
          htmlFor="bio"
          helper={
            user.role === 'FREELANCER'
              ? 'Describe your experience and how you work'
              : 'Tell freelancers what kind of projects you run'
          }
        >
          <Textarea
            id="bio"
            placeholder="Short intro for your public profile…"
            {...register('bio')}
          />
        </FormField>

        <FormField
          label="Skills"
          htmlFor="skillsText"
          helper="Comma-separated — e.g. Solidity, React, Foundry"
          error={errors.skillsText?.message}
        >
          <Input
            id="skillsText"
            placeholder="Solidity, React, Foundry"
            error={!!errors.skillsText}
            {...register('skillsText')}
          />
        </FormField>

        <div className="flex flex-col gap-2 md:flex-row md:justify-end md:gap-2">
          {isDirty && (
            <Button
              type="button"
              variant="ghost"
              fullWidth
              className="md:w-auto"
              disabled={isSubmitting}
              onClick={() => {
                reset()
                setError(null)
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!isDirty || isSubmitting}
            fullWidth
            className="md:w-auto"
          >
            Save changes
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <AppSection narrow>
      <PageHeader title="Profile settings" />
      {user ? (
        <SettingsForm key={user.id} user={user} />
      ) : (
        <p className="text-sm text-ink-500">Loading profile…</p>
      )}
    </AppSection>
  )
}
