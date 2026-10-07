import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { InviteFreelancerModal } from './InviteFreelancerModal'

vi.mock('@/lib/projects.api', () => ({
  inviteFreelancer: vi.fn(),
}))

afterEach(() => {
  cleanup()
  document.body.replaceChildren()
})

describe('InviteFreelancerModal', () => {
  it('disables send when the identifier is empty', () => {
    render(
      <InviteFreelancerModal
        open
        projectId="project-1"
        onClose={() => undefined}
      />,
    )

    expect(screen.getByRole('button', { name: 'Send invite' })).toBeDisabled()
  })

  it('enables send after an identifier is entered', async () => {
    const user = userEvent.setup()

    render(
      <InviteFreelancerModal
        open
        projectId="project-1"
        onClose={() => undefined}
      />,
    )

    await user.type(
      screen.getByPlaceholderText('freelancer@example.com or bob.eth'),
      'bob.eth',
    )

    expect(screen.getByRole('button', { name: 'Send invite' })).toBeEnabled()
  })
})
