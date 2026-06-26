import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { SkillPicker } from '@/components/features/project/SkillPicker'
import { AppSection } from '@/components/layout/AppSection'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { Input } from '@/components/ui/Input'
import { Link } from '@/components/ui/Link'
import { RolePill } from '@/components/ui/RolePill'
import { SettingsPageSkeleton } from '@/components/ui/Skeleton'
import { Textarea } from '@/components/ui/Textarea'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { displayName } from '@/lib/projectDisplay'
import { PROJECT_SKILLS, type ProjectSkill } from '@/lib/projectSkills'
import { updateProfileSchema } from '@/lib/validation'
import { ROUTES } from '@/router/routes'
import type { User } from '@/types/user'

const settingsFormSchema = updateProfileSchema.extend({
  skills: z.array(z.enum(PROJECT_SKILLS)).optional(),
})

type SettingsFormInput = z.infer<typeof settingsFormSchema>

function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase()
}

function toProjectSkills(skills: string[] | undefined): ProjectSkill[] {
  return (skills ?? []).filter((skill): skill is ProjectSkill =>
    PROJECT_SKILLS.includes(skill as ProjectSkill),
  )
}

function SettingsForm({ user }: { user: User }) {
  const navigate = useNavigate()
  const { update } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const defaultSkills = toProjectSkills(user.skills)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormInput>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      name: user.name ?? '',
      displayName: user.displayName ?? '',
      bio: user.bio ?? '',
      skills: defaultSkills,
    },
  })

  const onSubmit = async (data: SettingsFormInput) => {
    setError(null)
    try {
      await update({
        ...(data.name?.trim() && { name: data.name.trim() }),
        ...(data.displayName?.trim() && { displayName: data.displayName.trim() }),
        bio: data.bio?.trim() ?? '',
        skills: data.skills ?? [],
      })

      navigate(ROUTES.profile(user.id))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save profile'))
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-50/70 to-transparent"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 p-6 md:p-8">
        {error && <InlineAlert variant="error">{error}</InlineAlert>}

        <div className="flex flex-col gap-4 border-b border-ink-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 text-left">
            <div className="rounded-full bg-gradient-to-br from-brand-100 to-brand-50 p-1 shadow-md ring-1 ring-white">
              <Avatar
                name={user.displayName ?? user.name}
                size="settings"
                className="ring-2 ring-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-display text-lg font-semibold text-ink-900">
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
          className="flex flex-col gap-5 text-left"
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
            htmlFor="skills"
            helper="Tap to add skills — same picker as project creation"
            error={errors.skills?.message}
          >
            <Controller
              name="skills"
              control={control}
              render={({ field }) => (
                <SkillPicker
                  value={field.value ?? []}
                  onChange={field.onChange}
                  error={errors.skills?.message}
                />
              )}
            />
          </FormField>

          <div className="flex flex-col gap-2 border-t border-ink-100 pt-5 md:flex-row md:justify-end md:gap-2">
            {isDirty && (
              <Button
                type="button"
                variant="ghost"
                fullWidth
                className="md:w-auto"
                disabled={isSubmitting}
                onClick={() => {
                  reset({
                    name: user.name ?? '',
                    displayName: user.displayName ?? '',
                    bio: user.bio ?? '',
                    skills: defaultSkills,
                  })
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
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <AppSection narrow className="!py-8 md:!py-12">
      <PageHeader title="Profile settings" />
      {user ? (
        <SettingsForm key={user.id} user={user} />
      ) : (
        <SettingsPageSkeleton />
      )}
    </AppSection>
  )
}
