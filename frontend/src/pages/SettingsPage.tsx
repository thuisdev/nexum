import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AppSection } from '@/components/layout/AppSection'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { updateProfileSchema } from '@/lib/validation'
import type { User } from '@/types/user'

const settingsFormSchema = updateProfileSchema.extend({
  skillsText: z.string().optional(),
})

type SettingsFormInput = z.infer<typeof settingsFormSchema>

function SettingsForm({ user }: { user: User }) {
  const { update } = useAuth()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
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
    setMessage(null)
    try {
      const skills = (data.skillsText ?? '')
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)

      await update({
        ...(data.name?.trim() && { name: data.name.trim() }),
        ...(data.displayName?.trim() && { displayName: data.displayName.trim() }),
        ...(data.bio !== undefined && { bio: data.bio.trim() }),
        skills,
      })

      reset({
        name: data.name?.trim() ?? '',
        displayName: data.displayName?.trim() ?? '',
        bio: data.bio?.trim() ?? '',
        skillsText: skills.join(', '),
      })
      setMessage('Profile saved')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save profile'))
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-ink-200 bg-white p-6 shadow-sm">
      {message && <InlineAlert variant="success">{message}</InlineAlert>}
      {error && <InlineAlert variant="error">{error}</InlineAlert>}

      <div className="flex items-center gap-3">
        <Avatar name={user.displayName ?? user.name} size="settings" />
        <Button variant="secondary" size="sm" type="button" disabled>
          Change photo (soon)
        </Button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <FormField
          label="Display name"
          htmlFor="displayName"
          error={errors.displayName?.message}
        >
          <Input
            id="displayName"
            error={!!errors.displayName}
            {...register('displayName')}
          />
        </FormField>

        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" error={!!errors.name} {...register('name')} />
        </FormField>

        <FormField label="Bio" htmlFor="bio">
          <Textarea
            id="bio"
            placeholder="Tell clients and freelancers about yourself…"
            {...register('bio')}
          />
        </FormField>

        <FormField label="Skills" helper="Separate with commas">
          <Input
            placeholder="Solidity, React, Foundry"
            {...register('skillsText')}
          />
        </FormField>

        <div className="flex flex-col gap-2 md:flex-row md:justify-end md:gap-2">
          <Button type="submit" loading={isSubmitting} fullWidth className="md:w-auto">
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
