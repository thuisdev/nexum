import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ApplicationCard } from './ApplicationCard'

describe('ApplicationCard', () => {
  it('renders pitch and action buttons', async () => {
    const user = userEvent.setup()
    const onAccept = vi.fn()
    const onReject = vi.fn()

    render(
      <ApplicationCard
        freelancerName="freelancer.eth"
        timeAgo="Today"
        pitch="I have delivered similar dashboards before."
        onAccept={onAccept}
        onReject={onReject}
      />,
    )

    expect(screen.getByText('freelancer.eth')).toBeInTheDocument()
    expect(
      screen.getByText('I have delivered similar dashboards before.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Accept' }))
    await user.click(screen.getByRole('button', { name: 'Reject' }))

    expect(onAccept).toHaveBeenCalledOnce()
    expect(onReject).toHaveBeenCalledOnce()
  })
})
