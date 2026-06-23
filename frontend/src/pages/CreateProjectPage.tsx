import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppSection } from '@/components/layout/AppSection'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import {
  MilestoneRow,
  type MilestoneRowData,
  type MilestoneRowErrors,
} from '@/components/features/project/MilestoneRow'
import {
  createProjectFormSchema,
  type CreateProjectFormInput,
} from '@/lib/validation'
import { ROUTES } from '@/router/routes'

function emptyMilestone(): MilestoneRowData {
  return {
    id: crypto.randomUUID(),
    title: '',
    amount: '',
    deadline: '',
  }
}

type FormErrors = {
  title?: string
  description?: string
  budget?: string
  milestones?: string
  milestoneRows?: MilestoneRowErrors[]
}

function validateForm(data: CreateProjectFormInput): FormErrors {
  const result = createProjectFormSchema.safeParse(data)
  if (result.success) return {}

  const errors: FormErrors = {}
  const milestoneRows: MilestoneRowErrors[] = data.milestones.map(() => ({}))

  for (const issue of result.error.issues) {
    const [root, index, field] = issue.path

    if (root === 'milestones' && typeof index === 'number' && field) {
      const row = milestoneRows[index] ?? {}
      row[field as keyof MilestoneRowErrors] = issue.message
      milestoneRows[index] = row
    } else if (root === 'milestones' && field === undefined) {
      errors.milestones = issue.message
    } else if (typeof root === 'string' && index === undefined) {
      errors[root as keyof Omit<FormErrors, 'milestones' | 'milestoneRows'>] =
        issue.message
    }
  }

  if (milestoneRows.some((row) => row.title || row.amount || row.deadline)) {
    errors.milestoneRows = milestoneRows
  }

  return errors
}

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [currency, setCurrency] = useState('USDC')
  const [visibility, setVisibility] = useState('public')
  const [milestones, setMilestones] = useState<MilestoneRowData[]>([
    emptyMilestone(),
  ])
  const [errors, setErrors] = useState<FormErrors>({})

  const totalAllocated = milestones.reduce(
    (sum, m) => sum + (parseFloat(m.amount) || 0),
    0,
  )
  const budgetNum = parseFloat(budget) || 0
  const budgetMatch =
    budgetNum > 0 && Math.abs(totalAllocated - budgetNum) < 0.01

  const handleCreate = () => {
    const formData: CreateProjectFormInput = {
      title,
      description,
      budget,
      currency,
      visibility: visibility as 'public' | 'private',
      milestones: milestones.map(({ title, amount, deadline }) => ({
        title,
        amount,
        deadline,
      })),
    }

    const nextErrors = validateForm(formData)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    navigate(ROUTES.clientDashboard)
  }

  return (
    <AppSection narrow>
      <PageHeader title="New project" />
      <div className="flex flex-col gap-4 rounded-xl border border-ink-200 bg-white p-6 shadow-sm">
        <FormField label="Project title" error={errors.title}>
          <Input
            placeholder="e.g. Frontend for DeFi dashboard"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!errors.title}
          />
        </FormField>

        <FormField label="Description" error={errors.description}>
          <Textarea
            placeholder="Describe the scope, deliverables, and timeline…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={!!errors.description}
          />
        </FormField>

        <div className="flex flex-col gap-4 md:flex-row md:gap-4">
          <FormField label="Total budget" className="md:flex-1" error={errors.budget}>
            <Input
              placeholder="800"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              error={!!errors.budget}
            />
          </FormField>
          <FormField label="Currency" className="md:w-40 md:shrink-0">
            <Select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
            </Select>
          </FormField>
        </div>

        <FormField label="Visibility">
          <Select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option value="public">Public on job board</option>
            <option value="private">Private (invite only)</option>
          </Select>
        </FormField>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-900">Milestones</span>
          {milestones.map((row, index) => (
            <MilestoneRow
              key={row.id}
              value={row}
              canRemove={milestones.length > 1}
              errors={errors.milestoneRows?.[index]}
              onChange={(next) =>
                setMilestones((prev) =>
                  prev.map((m) => (m.id === row.id ? next : m)),
                )
              }
              onRemove={() =>
                setMilestones((prev) => prev.filter((m) => m.id !== row.id))
              }
            />
          ))}
          <Button
            variant="ghost"
            type="button"
            className="w-fit"
            onClick={() => setMilestones((prev) => [...prev, emptyMilestone()])}
          >
            + Add milestone
          </Button>
          <p className="text-xs text-ink-500">
            {totalAllocated.toLocaleString()} / {budgetNum.toLocaleString() || '0'}{' '}
            {currency}
            {budgetMatch ? ' ✓' : ''}
          </p>
          {errors.milestones && (
            <p className="text-xs leading-4 text-red-600" role="alert">
              {errors.milestones}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:gap-2">
          <Button
            type="button"
            fullWidth
            className="md:w-auto"
            onClick={handleCreate}
          >
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
      </div>
    </AppSection>
  )
}
