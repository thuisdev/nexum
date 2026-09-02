import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  AVATAR_COLORS,
  AVATAR_COLOR_CLASSES,
  type AvatarColor,
} from '@/lib/avatarColors'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { CLIENT_INDUSTRIES, MAX_CLIENT_INDUSTRIES } from '@/lib/clientIndustries'
import { displayName } from '@/lib/projectDisplay'
import { uploadAvatar } from '@/lib/users.api'
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validation'
import { ROUTES } from '@/router/routes'
import type { User } from '@/types/user'
import { cn } from '@/lib/utils'

type SettingsFormInput = UpdateProfileInput & {
  skills?: string[]
}

function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase()
}

function SettingsForm({ user }: { user: User }) {
  const navigate = useNavigate()
  const { update, applyUser } = useAuth()
  const isClient = user.role === 'CLIENT'
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? null)
  const [avatarColor, setAvatarColor] = useState<string | null>(user.avatarColor ?? null)
  const [avatarDirty, setAvatarDirty] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormInput>({
    resolver: zodResolver(updateProfileSchema.extend({ skills: updateProfileSchema.shape.skills })),
    defaultValues: {
      name: user.name ?? '',
      displayName: user.displayName ?? '',
      bio: user.bio ?? '',
      skills: user.skills ?? [],
    },
  })

  const onSubmit = async (data: SettingsFormInput) => {
    setError(null)
    try {
      await update({
        name: data.name?.trim() ? data.name.trim() : null,
        displayName: data.displayName?.trim() ? data.displayName.trim() : null,
        bio: data.bio?.trim() ?? '',
        skills: data.skills ?? [],
        ...(avatarDirty ? { avatarUrl, avatarColor: avatarColor as AvatarColor | null } : {}),
      })

      navigate(ROUTES.profile(user.id))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save profile'))
    }
  }

  const handleAvatarFile = async (file: File | undefined) => {
    if (!file) return
    setUploadingAvatar(true)
    setError(null)
    try {
      const updated = await uploadAvatar(file)
      setAvatarUrl(updated.avatarUrl ?? null)
      setAvatarDirty(true)
      applyUser(updated)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not upload image'))
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <div className="rounded-2xl border border-ink-200 bg-white shadow-sm">
      <div className="flex flex-col gap-6 p-6 md:p-8">
        {error && <InlineAlert variant="error">{error}</InlineAlert>}

        <div className="flex flex-col gap-4 border-b border-ink-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 text-left">
            <Avatar
              src={avatarUrl}
              color={avatarColor}
              name={user.displayName ?? user.name}
              size="settings"
              className="shadow-sm ring-1 ring-ink-200"
            />
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
          <FormField label="Profile photo" helper="Upload an image or pick an initial background">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleAvatarFile(e.target.files?.[0])}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload image
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAvatarUrl(null)
                  setAvatarDirty(true)
                }}
              >
                Use initials
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Avatar color ${color}`}
                  onClick={() => {
                    setAvatarColor(color)
                    setAvatarDirty(true)
                  }}
                  className={cn(
                    'size-8 rounded-full border-2 transition-[transform,border-color]',
                    AVATAR_COLOR_CLASSES[color],
                    avatarColor === color
                      ? 'scale-110 border-ink-900'
                      : 'border-transparent',
                  )}
                />
              ))}
            </div>
          </FormField>

          <FormField label="Email" htmlFor="email">
            <Input id="email" value={user.email} disabled readOnly />
          </FormField>

          <FormField
            label={isClient ? 'Organization name' : 'Display name'}
            htmlFor="displayName"
            helper="Public — shown on your profile and project cards"
            error={errors.displayName?.message}
          >
            <Input
              id="displayName"
              placeholder={isClient ? 'e.g. Acme Labs' : 'e.g. bob.eth'}
              error={!!errors.displayName}
              {...register('displayName')}
            />
          </FormField>

          {!isClient && (
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
          )}

          <FormField
            label="Bio"
            htmlFor="bio"
            helper={
              isClient
                ? 'Describe your organization and the kind of work you hire for'
                : 'Describe your experience and how you work'
            }
          >
            <Textarea
              id="bio"
              placeholder={
                isClient
                  ? 'What you build, team size, typical projects…'
                  : 'Short intro for your public profile…'
              }
              {...register('bio')}
            />
          </FormField>

          <FormField
            label={isClient ? 'Industries' : 'Skills'}
            htmlFor="skills"
            helper={
              isClient
                ? 'Pick sectors you hire in — presets or add your own with +'
                : 'Pick presets or add your own with +'
            }
            error={errors.skills?.message}
          >
            <Controller
              name="skills"
              control={control}
              render={({ field }) => (
                <SkillPicker
                  value={field.value ?? []}
                  onChange={field.onChange}
                  allowCustom
                  presets={isClient ? CLIENT_INDUSTRIES : undefined}
                  maxSkills={isClient ? MAX_CLIENT_INDUSTRIES : undefined}
                  customPlaceholder={isClient ? 'Custom industry' : 'Custom skill'}
                  error={errors.skills?.message}
                />
              )}
            />
          </FormField>

          <div className="flex flex-col gap-2 border-t border-ink-100 pt-5 md:flex-row md:justify-end md:gap-2">
            {(isDirty || avatarDirty) && (
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
                    skills: user.skills ?? [],
                  })
                  setAvatarUrl(user.avatarUrl ?? null)
                  setAvatarColor(user.avatarColor ?? null)
                  setAvatarDirty(false)
                  setError(null)
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={(!isDirty && !avatarDirty) || isSubmitting}
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
