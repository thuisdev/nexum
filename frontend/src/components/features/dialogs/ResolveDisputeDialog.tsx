import { useEffect, useState } from 'react'
import { Modal, ModalActions } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type { ProjectOpenDispute } from '@/types/project'

export type DisputePanelProps = {
  dispute: ProjectOpenDispute
  className?: string
}

export function DisputePanel({ dispute, className }: DisputePanelProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50/50 p-5 text-left ${className ?? ''}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-[1px] text-red-700">
          Active dispute
        </span>
        <span className="text-xs text-ink-500">
          {new Date(dispute.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm font-medium text-ink-900">{dispute.milestone.title}</p>
      <p className="text-sm leading-6 text-ink-700">{dispute.reason}</p>
    </div>
  )
}

export type ResolveDisputeDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: (outcome: string, resolution: string) => void
  loading?: boolean
  dispute: ProjectOpenDispute
}

export function ResolveDisputeDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  dispute,
}: ResolveDisputeDialogProps) {
  const [outcome, setOutcome] = useState('RESOLVED_FREELANCER')
  const [resolution, setResolution] = useState('')

  useEffect(() => {
    if (!open) {
      setOutcome('RESOLVED_FREELANCER')
      setResolution('')
    }
  }, [open])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Resolve dispute"
      footer={
        <ModalActions
          onCancel={onClose}
          onConfirm={() => onConfirm(outcome, resolution.trim())}
          confirmLabel="Resolve"
          confirmVariant="approve"
          loading={loading}
        />
      }
    >
      <DisputePanel dispute={dispute} />
      <Select
        value={outcome}
        onChange={(e) => setOutcome(e.target.value)}
      >
        <option value="RESOLVED_FREELANCER">Rule for freelancer</option>
        <option value="RESOLVED_CLIENT">Rule for client</option>
        <option value="SPLIT">Split outcome</option>
      </Select>
      <Textarea
        value={resolution}
        onChange={(e) => setResolution(e.target.value)}
        placeholder="Resolution note visible to both parties…"
        rows={3}
      />
    </Modal>
  )
}
