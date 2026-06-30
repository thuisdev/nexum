import { describe, expect, it } from 'vitest'

import { displayName, mapProjectStatus, projectDraftMeta } from './projectDisplay'
import type { Project } from '@/types/project'

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

describe('projectDraftMeta', () => {
  it('describes public projects waiting for applications', () => {
    const project = {
      isPublic: true,
      freelancerId: null,
      invitedFreelancerId: null,
    } as Project

    expect(projectDraftMeta(project)).toContain('applications')
  })
})
