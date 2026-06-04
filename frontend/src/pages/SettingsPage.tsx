import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validation'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { useState, useEffect } from 'react'


const SettingsPage = () => {
  const { user, update } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<UpdateProfileInput>({
      resolver: zodResolver(updateProfileSchema),
      defaultValues: { name: '', displayName: '' },
    });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? '',
        displayName: user.displayName ?? '',
      });
    }
  }, [user, reset])

  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (data: UpdateProfileInput) => {
    setError(null);
    setMessage(null);
    try {
      await update(data)
      setMessage('Profile saved');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save profile'));
    }
  };

  return (
    <>
      <section>
        <h1>Settings</h1>
        {message && <p>{message}</p>}
        {error && <p role="alert">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="name">Name</label>
            <input id="name" {...register('name')} />
            {errors.name && <p role="alert">{errors.name.message}</p>}
          </div>


          <div>
            <label htmlFor="displayName">Display name</label>
            <input id="displayName" {...register('displayName')} />
            {errors.displayName && <p role="alert">{errors.displayName.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save'}
          </button>
        </form>
      </section>
    </>
  )
}

export default SettingsPage
