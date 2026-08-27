import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppSection } from '@/components/layout/AppSection'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { ProjectDetailSkeleton } from '@/components/ui/Skeleton'
import {
  MilestoneRow,
  type MilestoneRowData,
  type MilestoneRowErrors,
} from '@/components/features'
import { SkillPicker } from '@/components/features/project/SkillPicker'
import { MAX_PROJECT_SKILLS } from '@/lib/projectSkills'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import { getProject, updateProject } from '@/lib/projects.api'
import { canEditProject } from '@/lib/projectDisplay'
import {
  createProjectFormSchema,
  type CreateProjectFormInput,
} from '@/lib/validation'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/hooks/useAuth'
import type { Project } from '@/types/project'

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

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [currency, setCurrency] = useState('USDC')
  const [visibility, setVisibility] = useState('public')
  const [skills, setSkills] = useState<string[]>([])
  const [milestones, setMilestones] = useState<MilestoneRowData[]>([
    emptyMilestone(),
  ])
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    getProject(id)
      .then((data) => {
        if (cancelled) return
        setProject(data)
        setTitle(data.title)
        setDescription(data.description)
        setBudget(data.totalBudget)
        setCurrency(data.currency)
        setVisibility(data.isPublic ? 'public' : 'private')
        setSkills(data.skills)
        setMilestones(
          data.milestones.map((m) => ({
            id: m.id,
            title: m.title,
            amount: m.amount,
            deadline: m.deadline.slice(0, 10),
            description: m.description,
          })),
        )
        setLoadError(null)
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(getApiErrorMessage(err, 'Could not load project'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <AppSection narrow className="!py-8 md:!py-12">
        <ProjectDetailSkeleton />
      </AppSection>
    )
  }

  if (loadError || !project || !user || !id) {
    return (
      <AppSection narrow>
        <InlineAlert variant="error">{loadError ?? 'Project not found'}</InlineAlert>
      </AppSection>
    )
  }

  const editable = canEditProject(project, user.id)

  if (!editable) {
    return (
      <AppSection narrow>
        <InlineAlert variant="error">
          This project can only be edited while it is still a draft, before
          escrow is funded, and before a freelancer is assigned.
        </InlineAlert>
        <Button
          variant="ghost"
          className="mt-4 w-fit"
          onClick={() => navigate(ROUTES.project(id))}
        >
          Back to project
        </Button>
      </AppSection>
    )
  }

  const totalAllocated = milestones.reduce(
    (sum, m) => sum + (parseFloat(m.amount) || 0),
    0,
  )
  const budgetNum = parseFloat(budget) || 0
  const budgetMatch =
    budgetNum > 0 && Math.abs(totalAllocated - budgetNum) < 0.01

  const handleSave = async () => {
    const formData: CreateProjectFormInput = {
      title,
      description,
      budget,
      currency,
      visibility: visibility as 'public' | 'private',
      skills,
      milestones: milestones.map(({ title: t, amount, deadline, description }) => ({
        title: t,
        amount,
        deadline,
        description,
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
      await updateProject(id, {
        title: formData.title,
        description: formData.description,
        totalBudget: formData.budget,
        currency: formData.currency,
        isPublic: formData.visibility === 'public',
        skills: formData.skills,
        milestones: formData.milestones.map((milestone, index) => ({
          orderIndex: index,
          title: milestone.title,
          description: milestone.description?.trim() || milestone.title,
          amount: milestone.amount,
          deadline: milestone.deadline,
        })),
      })
      navigate(ROUTES.project(id))
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not save project'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppSection narrow className="!py-8 md:!py-12">
      <PageHeader
        title="Edit project"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.project(id))}
          >
            Cancel
          </Button>
        }
      />

      {submitError && <InlineAlert variant="error">{submitError}</InlineAlert>}

      <div className="flex flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-6 shadow-sm md:p-8">
        <FormField label="Project title" error={errors.title}>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={!!errors.title}
              />
            </FormField>

            <FormField label="Description" error={errors.description}>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={!!errors.description}
              />
            </FormField>

            <div className="flex flex-col gap-4 md:flex-row">
              <FormField label="Total budget" className="md:flex-1" error={errors.budget}>
                <Input
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  error={!!errors.budget}
                />
              </FormField>
              <FormField label="Currency" className="md:w-40 md:shrink-0">
                <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
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

            <FormField label="Skills">
              <SkillPicker
                value={skills}
                onChange={setSkills}
                allowCustom
                maxSkills={MAX_PROJECT_SKILLS}
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
                <p className="text-xs text-red-600">{errors.milestones}</p>
              )}
            </div>

        <Button loading={submitting} onClick={() => void handleSave()}>
          Save changes
        </Button>
      </div>
    </AppSection>
  )
}
