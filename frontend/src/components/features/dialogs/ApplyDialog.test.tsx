import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApplyDialog } from './ApplyDialog'

afterEach(() => {
  cleanup()
  document.body.replaceChildren()
})

describe('ApplyDialog', () => {
  it('submits the current pitch', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <ApplyDialog
        open
        onClose={() => undefined}
        onSubmit={onSubmit}
        pitch="Ready to start this week."
        onPitchChange={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Send application' }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(screen.getByText('Apply to this project')).toBeInTheDocument()
  })

  it('disables send when the pitch is too short', () => {
    render(
      <ApplyDialog
        open
        onClose={() => undefined}
        onSubmit={() => undefined}
        pitch="short"
        onPitchChange={() => undefined}
      />,
    )

    expect(screen.getByRole('button', { name: 'Send application' })).toBeDisabled()
    expect(
      screen.getByText('Pitch must be at least 10 characters'),
    ).toBeInTheDocument()
  })
})
