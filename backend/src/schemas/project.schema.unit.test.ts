import { describe, expect, it } from 'vitest';

import { updateProjectSchema } from './project.schema.js';

const tomorrow = new Date(Date.now() + 86_400_000).toISOString();

const milestone = {
  orderIndex: 0,
  title: 'Design',
  description: 'Wireframes',
  amount: '500.00',
  deadline: tomorrow,
};

describe('updateProjectSchema', () => {
  it('allows a title-only patch', () => {
    const result = updateProjectSchema.safeParse({ title: 'New title' });
    expect(result.success).toBe(true);
  });

  it('rejects a budget patch without milestones', () => {
    const result = updateProjectSchema.safeParse({ totalBudget: '800.00' });
    expect(result.success).toBe(false);
  });

  it('rejects milestones without a matching budget', () => {
    const result = updateProjectSchema.safeParse({ milestones: [milestone] });
    expect(result.success).toBe(false);
  });

  it('accepts budget and milestones when they sum to the same amount', () => {
    const result = updateProjectSchema.safeParse({
      totalBudget: '500.00',
      milestones: [milestone],
    });
    expect(result.success).toBe(true);
  });

  it('rejects budget and milestones that do not sum', () => {
    const result = updateProjectSchema.safeParse({
      totalBudget: '999.00',
      milestones: [milestone],
    });
    expect(result.success).toBe(false);
  });
});
