import { describe, expect, it } from 'vitest'

import {
  canSubmitMilestone,
  displayName,
  formatDeadline,
  mapMilestoneStatus,
  mapProjectStatus,
  projectDraftMeta,
} from './projectDisplay'
import type { Milestone, Project } from '@/types/project'

describe('displayName', () => {
  it('prefers displayName over name', () => {
    expect(displayName({ displayName: 'alice.eth', name: 'Alice' })).toBe(
      'alice.eth',
    )
  })

  it('falls back when user is missing', () => {
    expect(displayName(null)).toBe('Anonymous')
  })
})

describe('mapProjectStatus', () => {
  it('maps known statuses', () => {
    expect(mapProjectStatus('IN_PROGRESS')).toBe('IN_PROGRESS')
    expect(mapProjectStatus('COMPLETED')).toBe('COMPLETED')
  })
})

describe('mapMilestoneStatus', () => {
  it('maps a refunded milestone instead of falling back to pending', () => {
    expect(mapMilestoneStatus('REFUNDED')).toBe('REFUNDED')
  })

  it('does not invent a revision status', () => {
    expect(mapMilestoneStatus('REVISION')).toBe('PENDING')
  })
})

describe('formatDeadline', () => {
  it('keeps the calendar date instead of shifting UTC midnight locally', () => {
    expect(formatDeadline('2026-12-01T00:00:00.000Z')).toBe(
      new Date(2026, 11, 1).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    )
  })
})

describe('projectDraftMeta', () => {
  it('tells clients to fund before a public job is listed', () => {
    const project = {
      isPublic: true,
      freelancerId: null,
      invitedFreelancerId: null,
      status: 'DRAFT',
      escrowStatus: 'NOT_FUNDED',
    } as Project

    expect(projectDraftMeta(project)).toContain('fund escrow')
  })

  it('describes funded public jobs as listed on the board', () => {
    const project = {
      isPublic: true,
      freelancerId: null,
      invitedFreelancerId: null,
      status: 'FUNDED',
      escrowStatus: 'FUNDED',
    } as Project

    expect(projectDraftMeta(project)).toContain('job board')
  })
})

describe('canSubmitMilestone', () => {
  const project = {
    freelancerId: 'freelancer-1',
    status: 'IN_PROGRESS',
  } as Project

  it('allows the assigned freelancer to submit while in progress', () => {
    expect(
      canSubmitMilestone(
        project,
        { status: 'IN_PROGRESS' } as Milestone,
        'freelancer-1',
      ),
    ).toBe(true)
  })

  it('allows a new version while the milestone is still submitted', () => {
    expect(
      canSubmitMilestone(
        project,
        { status: 'SUBMITTED' } as Milestone,
        'freelancer-1',
      ),
    ).toBe(true)
  })

  it('does not allow submit after payout or dispute', () => {
    expect(
      canSubmitMilestone(
        project,
        { status: 'PAID' } as Milestone,
        'freelancer-1',
      ),
    ).toBe(false)
    expect(
      canSubmitMilestone(
        project,
        { status: 'DISPUTED' } as Milestone,
        'freelancer-1',
      ),
    ).toBe(false)
  })
})
