import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { AppSection } from '@/components/layout/AppSection'
import { PageHeader } from '@/components/layout/PageHeader'
import { MilestoneRow } from '@/components/features/project/MilestoneRow'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import {
  createProjectFormSchema,
  type CreateProjectFormInput,
} from '@/lib/validation'
import { ROUTES } from '@/router/routes'

const emptyMilestone = () => ({
  title: '',
  amount: '',
  deadline: '',
})

export default function CreateProjectPage() {
  const navigate = useNavigate()

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectFormInput>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      title: '',
      description: '',
      budget: '',
      currency: 'USDC',
      visibility: 'public',
      milestones: [emptyMilestone()],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'milestones',
  })

  const milestones = watch('milestones')
  const budget = watch('budget')
  const currency = watch('currency')

  const totalAllocated = milestones.reduce(
    (sum, milestone) => sum + (parseFloat(milestone.amount) || 0),
    0,
  )
  const budgetNum = parseFloat(budget) || 0
  const budgetMatch =
    budgetNum > 0 && Math.abs(totalAllocated - budgetNum) < 0.01

  const milestonesError =
    errors.milestones?.message ?? errors.milestones?.root?.message

  const onSubmit = () => {
    navigate(ROUTES.clientDashboard)
  }

  return (
    <AppSection narrow>
      <PageHeader title="New project" />
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4 rounded-xl border border-ink-200 bg-white p-6 shadow-sm"
      >
        <FormField
          label="Project title"
          htmlFor="title"
          error={errors.title?.message}
        >
          <Input
            id="title"
            placeholder="e.g. Frontend for DeFi dashboard"
            error={!!errors.title}
            {...register('title')}
          />
        </FormField>

        <FormField
          label="Description"
          htmlFor="description"
          error={errors.description?.message}
        >
          <Textarea
            id="description"
            placeholder="Describe the scope, deliverables, and timeline…"
            error={!!errors.description}
            {...register('description')}
          />
        </FormField>

        <div className="flex flex-col gap-4 md:flex-row md:gap-4">
          <FormField
            label="Total budget"
            htmlFor="budget"
            className="md:flex-1"
            error={errors.budget?.message}
          >
            <Input
              id="budget"
              placeholder="800"
              error={!!errors.budget}
              {...register('budget')}
            />
          </FormField>
          <FormField label="Currency" className="md:w-40 md:shrink-0">
            <Select {...register('currency')}>
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
            </Select>
          </FormField>
        </div>

        <FormField label="Visibility">
          <Select {...register('visibility')}>
            <option value="public">Public on job board</option>
            <option value="private">Private (invite only)</option>
          </Select>
        </FormField>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-900">Milestones</span>
          {fields.map((field, index) => (
            <MilestoneRow
              key={field.id}
              value={milestones[index]}
              canRemove={fields.length > 1}
              errors={{
                title: errors.milestones?.[index]?.title?.message,
                amount: errors.milestones?.[index]?.amount?.message,
                deadline: errors.milestones?.[index]?.deadline?.message,
              }}
              onChange={(next) => {
                setValue(`milestones.${index}`, next, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }}
              onRemove={() => remove(index)}
            />
          ))}
          <Button
            variant="ghost"
            type="button"
            className="w-fit"
            onClick={() => append(emptyMilestone())}
          >
            + Add milestone
          </Button>
          <p className="text-xs text-ink-500">
            {totalAllocated.toLocaleString()} /{' '}
            {budgetNum.toLocaleString() || '0'} {currency}
            {budgetMatch ? ' ✓' : ''}
          </p>
          {milestonesError && (
            <p className="text-xs leading-4 text-red-600" role="alert">
              {milestonesError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:gap-2">
          <Button type="submit" fullWidth className="md:w-auto">
            Create project
          </Button>
          <Button
            variant="ghost"
            type="button"
            fullWidth
            className="md:w-auto"
            onClick={() => navigate(ROUTES.clientDashboard)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </AppSection>
  )
}
