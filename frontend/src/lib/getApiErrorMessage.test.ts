import { describe, expect, it } from 'vitest'

import { getApiErrorMessage } from './getApiErrorMessage'

function axiosError(data: unknown) {
  return {
    isAxiosError: true,
    response: { data },
  }
}

describe('getApiErrorMessage', () => {
  it('flattens backend fieldErrors into one message', () => {
    const message = getApiErrorMessage(
      axiosError({
        error: 'Validation failed',
        details: {
          formErrors: [],
          fieldErrors: {
            pitch: ['Pitch must be at least 10 characters'],
          },
        },
      }),
    )

    expect(message).toBe('Pitch must be at least 10 characters')
  })

  it('joins formErrors and fieldErrors', () => {
    const message = getApiErrorMessage(
      axiosError({
        error: 'Validation failed',
        details: {
          formErrors: ['Milestone amounts must add up to the total budget'],
          fieldErrors: {
            title: ['Title is required'],
          },
        },
      }),
    )

    expect(message).toBe(
      'Milestone amounts must add up to the total budget · Title is required',
    )
  })

  it('falls back to error when details are empty', () => {
    const message = getApiErrorMessage(
      axiosError({ error: 'Forbidden' }),
      'Could not load',
    )

    expect(message).toBe('Forbidden')
  })
})
