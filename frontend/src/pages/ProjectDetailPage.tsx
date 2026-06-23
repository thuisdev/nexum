import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppSection } from '@/components/layout/AppSection'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import {
  ActivityTimelineItem,
  ApplicationCard,
  ApproveDialog,
  MilestoneCard,
  PartiesBlock,
  SubmitWorkDialog,
} from '@/components/features'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { MOCK_MILESTONES } from '@/lib/mockData'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/hooks/useAuth'

const DETAIL_TABS = [
  { id: 'milestones', label: 'Milestones' },
  { id: 'activity', label: 'Activity' },
  { id: 'applications', label: 'Applications' },
]

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('milestones')
  const [approveOpen, setApproveOpen] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [submitNote, setSubmitNote] = useState('')
  const [submitFile, setSubmitFile] = useState<File | null>(null)

  const isClient = user?.role === 'CLIENT' || user?.role === 'ADMIN'
  const title = 'Frontend for DeFi dashboard'

  return (
    <AppSection>
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        onClick={() => navigate(ROUTES.dashboard)}
      >
        ← Back to dashboard
      </Button>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
          <h1 className="font-display text-2xl font-bold leading-8 text-ink-900 md:text-[36px] md:leading-10">
            {title}
          </h1>
          <StatusBadge status="IN_PROGRESS" />
        </div>

        <PartiesBlock
          parties={[
            { role: 'Client', name: 'alice.eth' },
            { role: 'Freelancer', name: 'bob.eth' },
          ]}
        />

        <p className="font-mono text-[28px] font-medium leading-[34px] text-ink-900">
          800 USDC
        </p>

        {isClient && (
          <Button
            className="w-full md:w-auto"
            onClick={() => undefined}
          >
            Fund project
          </Button>
        )}
      </div>

      <Tabs tabs={DETAIL_TABS} activeId={activeTab} onChange={setActiveTab} />

      {activeTab === 'milestones' && (
        <div className="flex flex-col gap-3">
          {MOCK_MILESTONES.map((m) => (
            <MilestoneCard
              key={m.id}
              title={m.title}
              amount={m.amount}
              deadline={m.deadline}
              status={m.status}
              actionLabel={m.actionLabel}
              actionVariant={m.actionVariant}
              onAction={() => {
                if (m.actionLabel?.includes('Approve')) setApproveOpen(true)
                else setSubmitOpen(true)
              }}
            />
          ))}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="flex flex-col">
          <ActivityTimelineItem
            actor="bob.eth"
            action="submitted milestone Visual design"
            time="2 hours ago"
            type="submitted"
          />
          <ActivityTimelineItem
            actor="alice.eth"
            action="approved milestone Wireframes"
            time="3 days ago"
            type="approved"
            isLast
          />
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="flex flex-col gap-4">
          <ApplicationCard
            freelancerName="carol.eth"
            verified
            timeAgo="1d ago"
            pitch="I've built 12 DeFi dashboards with React and/ethers.js. Happy to share references."
          />
        </div>
      )}

      <ApproveDialog
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onConfirm={() => setApproveOpen(false)}
        amount="300"
        recipient="bob.eth"
      />

      <SubmitWorkDialog
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onSubmit={() => setSubmitOpen(false)}
        milestoneTitle="Visual design"
        note={submitNote}
        onNoteChange={setSubmitNote}
        file={submitFile}
        onFileChange={setSubmitFile}
      />

      <span className="sr-only">Project id: {id}</span>
    </AppSection>
  )
}
