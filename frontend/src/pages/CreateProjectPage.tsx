import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppSection } from '@/components/layout/AppSection'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import {
  MilestoneRow,
  type MilestoneRowData,
  type MilestoneRowErrors,
} from '@/components/features/project/MilestoneRow'
import { SkillPicker } from '@/components/features/project/SkillPicker'
import { type ProjectSkill } from '@/lib/projectSkills'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { createProject } from '@/lib/projects.api'
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
  skills?: string
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
    } else if (root === 'skills') {
      errors.skills = issue.message
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
  const [skills, setSkills] = useState<ProjectSkill[]>([])
  const [milestones, setMilestones] = useState<MilestoneRowData[]>([
    emptyMilestone(),
  ])
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const totalAllocated = milestones.reduce(
    (sum, m) => sum + (parseFloat(m.amount) || 0),
    0,
  )
  const budgetNum = parseFloat(budget) || 0
  const budgetMatch =
    budgetNum > 0 && Math.abs(totalAllocated - budgetNum) < 0.01

  const handleCreate = async () => {
    const formData: CreateProjectFormInput = {
      title,
      description,
      budget,
      currency,
      visibility: visibility as 'public' | 'private',
      skills,
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
    setSubmitError(null)
    setSubmitting(true)

    try {
      const isPublic = formData.visibility === 'public'
      const project = await createProject({
        title: formData.title,
        description: formData.description,
        totalBudget: formData.budget,
        currency: formData.currency,
        isPublic,
        skills: formData.skills,
        milestones: formData.milestones.map((milestone, index) => ({
          orderIndex: index,
          title: milestone.title,
          description: milestone.title,
          amount: milestone.amount,
          deadline: milestone.deadline,
        })),
      })

      navigate(
        isPublic
          ? ROUTES.project(project.id)
          : `${ROUTES.project(project.id)}?invite=1`,
      )
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not create project'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppSection narrow>
      <PageHeader title="New project" />
      {submitError && <InlineAlert variant="error">{submitError}</InlineAlert>}
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

        <FormField label="Skills" helper="Select at least one — used on the job board">
          <SkillPicker
            value={skills}
            onChange={(next) => setSkills(next as typeof skills)}
            error={errors.skills}
          />
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
            loading={submitting}
            onClick={() => void handleCreate()}
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
