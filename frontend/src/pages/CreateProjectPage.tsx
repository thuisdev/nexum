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
} from '@/components/features/project/MilestoneRow'
import { ROUTES } from '@/router/routes'

function emptyMilestone(): MilestoneRowData {
  return {
    id: crypto.randomUUID(),
    title: '',
    amount: '',
    deadline: '',
  }
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

  const totalAllocated = milestones.reduce(
    (sum, m) => sum + (parseFloat(m.amount) || 0),
    0,
  )
  const budgetNum = parseFloat(budget) || 0
  const budgetMatch =
    budgetNum > 0 && Math.abs(totalAllocated - budgetNum) < 0.01

  return (
    <AppSection narrow>
      <PageHeader title="New project" />
      <div className="flex flex-col gap-4 rounded-xl border border-ink-200 bg-white p-6 shadow-sm">
        <FormField label="Project title">
          <Input
            placeholder="e.g. Frontend for DeFi dashboard"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormField>

        <FormField label="Description">
          <Textarea
            placeholder="Describe the scope, deliverables, and timeline…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormField>

        <div className="flex flex-col gap-4 md:flex-row md:gap-4">
          <FormField label="Total budget" className="md:flex-1">
            <Input
              placeholder="800"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
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
          {milestones.map((row) => (
            <MilestoneRow
              key={row.id}
              value={row}
              canRemove={milestones.length > 1}
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
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:gap-2">
          <Button
            type="button"
            fullWidth
            className="md:w-auto"
            onClick={() => navigate(ROUTES.clientDashboard)}
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
