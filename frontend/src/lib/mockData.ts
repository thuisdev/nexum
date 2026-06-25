import type { ProjectCardProps } from '@/components/features/project/ProjectCard'
import type { WorkListItem } from '@/components/features/profile/WorkList'

export const JOB_BOARD_PROJECTS: Omit<
  ProjectCardProps,
  'variant' | 'onCardClick' | 'onApply'
>[] = [
  {
    id: '1',
    title: 'Frontend for DeFi dashboard',
    amount: '2,500',
    partyName: 'alice.eth',
    verified: true,
    timeAgo: '2d ago',
    tags: ['React', 'TypeScript', 'Web3'],
    milestoneCount: 3,
  },
  {
    id: '2',
    title: 'Audit our staking contract',
    amount: '5,000',
    partyName: 'dao-x',
    verified: false,
    timeAgo: '5h ago',
    tags: ['Solidity', 'Foundry', 'Security'],
    milestoneCount: 2,
  },
  {
    id: '3',
    title: 'Brand & logo for L2 protocol',
    amount: '1,800',
    partyName: 'mira.eth',
    verified: true,
    timeAgo: '1d ago',
    tags: ['Branding', 'Figma', 'Illustration'],
    milestoneCount: 4,
  },
]

export const CLIENT_PROJECTS: Omit<
  ProjectCardProps,
  'variant' | 'onCardClick'
>[] = [
  {
    id: '1',
    title: 'Frontend for DeFi dashboard',
    amount: '800',
    status: 'IN_PROGRESS',
    partyName: 'bob.eth',
    verified: true,
    clientState: 'in_progress',
    milestonesDone: 2,
    milestonesTotal: 3,
    progressAmountText: '533 USDC released',
    progressValue: 66,
    reviewCount: 1,
    footLinkLabel: 'Review →',
    footLinkTo: '/projects/1',
  },
  {
    id: '4',
    title: 'Mobile wallet UI refresh',
    amount: '3,200',
    status: 'DRAFT',
    applicantCount: 4,
    clientState: 'draft',
    draftMeta: 'Not funded yet · public on job board',
    footLinkLabel: 'Review applicants →',
    footLinkTo: '/projects/4',
  },
]

export const FREELANCER_ACTIVE: Omit<
  ProjectCardProps,
  'variant' | 'onCardClick'
>[] = [
  {
    id: '1',
    title: 'Frontend for DeFi dashboard',
    amount: '800',
    status: 'IN_PROGRESS',
    partyName: 'alice.eth',
    verified: true,
    freelancerState: 'in_progress',
    milestonesDone: 1,
    milestonesTotal: 2,
    progressAmountText: '2,500 USDC earned',
    progressValue: 50,
    submitLabel: 'Submit milestone 2',
  },
]

export const FREELANCER_INVITED: Omit<
  ProjectCardProps,
  'variant' | 'onCardClick' | 'onAccept' | 'onDecline'
>[] = [
  {
    id: '5',
    title: 'NFT marketplace MVP',
    amount: '4,500',
    status: 'INVITED',
    partyName: 'mira.eth',
    verified: true,
    freelancerState: 'invited',
    milestoneCount: 3,
  },
]

export const PROFILE_STATS = [
  { id: '1', value: '24', label: 'Projects completed' },
  { id: '2', value: '48,200', label: 'USDC via escrow', highlight: true },
  { id: '3', value: '100%', label: 'On-time delivery' },
  { id: '4', value: '4.9', label: 'Rating · 18 reviews' },
]

export const PROFILE_WORK: WorkListItem[] = [
  {
    id: '1',
    title: 'DeFi dashboard frontend',
    clientName: 'alice.eth',
    amount: '2,500',
  },
  {
    id: '2',
    title: 'Staking contract audit',
    clientName: 'dao-x',
    amount: '5,000',
  },
  {
    id: '3',
    title: 'Token vesting UI',
    clientName: 'mira.eth',
    amount: '1,200',
  },
]

export const PROFILE_REVIEWS = [
  {
    id: '1',
    rating: 5.0,
    author: 'alice.eth',
    timeAgo: '3 weeks ago',
    text: 'Delivered every milestone early and communicated clearly. Would hire again.',
  },
  {
    id: '2',
    rating: 4.8,
    author: 'dao-x',
    timeAgo: '2 months ago',
    text: 'Found two critical bugs in our staking audit. Thorough and fast.',
  },
]

import type { StatusBadgeStatus } from '@/components/ui/StatusBadge'

export const MOCK_MILESTONES: {
  id: string
  title: string
  amount: string
  deadline: string
  status: StatusBadgeStatus
  actionLabel?: string
  actionVariant?: 'primary' | 'approve'
}[] = [
  {
    id: 'm1',
    title: 'Wireframes & IA',
    amount: '200',
    deadline: 'Mar 1',
    status: 'PAID',
  },
  {
    id: 'm2',
    title: 'Visual design',
    amount: '300',
    deadline: 'Mar 15',
    status: 'SUBMITTED',
    actionLabel: 'Approve',
    actionVariant: 'approve',
  },
  {
    id: 'm3',
    title: 'Final delivery',
    amount: '300',
    deadline: 'Apr 1',
    status: 'PENDING',
  },
]
