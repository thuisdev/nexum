import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MilestoneCard } from './MilestoneCard'
import type { MilestoneSubmission } from '@/types/project'

const submission: MilestoneSubmission = {
  id: 'sub-1',
  content: 'First delivery of the dashboard screens.',
  fileUrl: null,
  version: 1,
  submittedAt: '2026-11-01T12:00:00.000Z',
}

describe('MilestoneCard', () => {
  it('keeps the last delivery visible after request-changes', () => {
    render(
      <MilestoneCard
        title="Build UI"
        amount="400"
        deadline="Nov 1, 2026"
        status="IN_PROGRESS"
        submission={submission}
      />,
    )

    expect(screen.getByText('Previous submission')).toBeInTheDocument()
    expect(
      screen.getByText('First delivery of the dashboard screens.'),
    ).toBeInTheDocument()
  })
})
