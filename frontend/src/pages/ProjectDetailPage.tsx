import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Link } from '@/components/ui/Link'
import { AppSection } from '@/components/layout/AppSection'
import { Button } from '@/components/ui/Button'
import { InlineAlert } from '@/components/ui/InlineAlert'
import {
  InviteFreelancerModal,
  MilestoneCard,
  PartiesBlock,
} from '@/components/features'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Tag } from '@/components/ui/Tag'
import { EscrowPill } from '@/components/ui/EscrowPill'
import { getApiErrorMessage } from '@/lib/getApiErrorMessage'
import {
  acceptInvite,
  fundProject,
  getProject,
  getProjectPreview,
} from '@/lib/projects.api'
import {
  formatDeadline,
  mapMilestoneStatus,
  mapProjectStatus,
  previewClientName,
  projectEscrowLabel,
  resolveClientCardStatus,
  resolveFreelancerCardStatus,
} from '@/lib/projectDisplay'
import { ROUTES } from '@/router/routes'
import { useAuth } from '@/hooks/useAuth'
import type { Project, ProjectPreview } from '@/types/project'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [preview, setPreview] = useState<ProjectPreview | null>(null)
  const [mode, setMode] = useState<'full' | 'preview' | 'error'>('full')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(searchParams.get('invite') === '1')
  const [actionLoading, setActionLoading] = useState(false)

  const reloadProject = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    if (user) {
      try {
        const full = await getProject(id)
        setProject(full)
        setPreview(null)
        setMode('full')
        setLoading(false)
        return
      } catch (err) {
        if (
          !axios.isAxiosError(err) ||
          (err.response?.status !== 403 && err.response?.status !== 404)
        ) {
          setError(getApiErrorMessage(err, 'Could not load project'))
          setMode('error')
          setLoading(false)
          return
        }
      }
    }

    try {
      const data = await getProjectPreview(id)
      setPreview(data)
      setProject(null)
      setMode('preview')
    } catch {
      setError(
        user
          ? 'This project is private or does not exist.'
          : 'Project not found. Log in if you were invited.',
      )
      setMode('error')
    } finally {
      setLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const load = async () => {
      if (user) {
        try {
          const full = await getProject(id)
          if (cancelled) return
          setProject(full)
          setPreview(null)
          setMode('full')
          setLoading(false)
          return
        } catch (err) {
          if (cancelled) return
          if (
            !axios.isAxiosError(err) ||
            (err.response?.status !== 403 && err.response?.status !== 404)
          ) {
            setError(getApiErrorMessage(err, 'Could not load project'))
            setMode('error')
            setLoading(false)
            return
          }
        }
      }

      try {
        const data = await getProjectPreview(id)
        if (cancelled) return
        setPreview(data)
        setProject(null)
        setMode('preview')
        setError(null)
      } catch {
        if (cancelled) return
        setError(
          user
            ? 'This project is private or does not exist.'
            : 'Project not found. Log in if you were invited.',
        )
        setMode('error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [id, user])

  const closeInviteModal = () => {
    setInviteOpen(false)
    if (searchParams.get('invite')) {
      searchParams.delete('invite')
      setSearchParams(searchParams, { replace: true })
    }
  }

  const handleAccept = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      const updated = await acceptInvite(id)
      setProject(updated)
      setMode('full')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not accept invite'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleFund = async () => {
    if (!id) return
    setActionLoading(true)
    try {
      const updated = await fundProject(id)
      setProject(updated)
      setMode('full')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not fund project'))
    } finally {
      setActionLoading(false)
    }
  }

  const isClientOwner =
    mode === 'full' &&
    project &&
    user &&
    user.id === project.clientId &&
    (user.role === 'CLIENT' || user.role === 'ADMIN')

  const isInvitedFreelancer =
    mode === 'full' &&
    project &&
    user?.id === project.invitedFreelancerId &&
    !project.freelancerId

  const canInvite =
    isClientOwner && project?.status === 'DRAFT' && !project.freelancerId && !project.invitedFreelancerId

  const canFund =
    isClientOwner &&
    project?.status === 'DRAFT' &&
    !!project.freelancerId

  const title = project?.title ?? preview?.title ?? 'Project'
  const description = project?.description ?? preview?.description
  const budget = project?.totalBudget ?? preview?.totalBudget
  const currency = project?.currency ?? preview?.currency ?? 'USDC'
  const skills = project?.skills ?? preview?.skills ?? []

  const statusInfo =
    mode === 'full' && project && user
      ? user.id === project.clientId
        ? resolveClientCardStatus(project)
        : resolveFreelancerCardStatus(project, user.id)
      : {
          status: mapProjectStatus(preview?.status ?? 'DRAFT'),
        }

  const milestones: Array<{
    id?: string
    orderIndex: number
    title: string
    description: string
    amount: string
    deadline: string | Date
    status: string
  }> =
    mode === 'full'
      ? (project?.milestones ?? [])
      : (preview?.milestones ?? []).map((milestone, index) => ({
          id: String(index),
          ...milestone,
          status: 'PENDING',
        }))

  const backTarget = user ? ROUTES.dashboard : ROUTES.jobs

  if (loading) {
    return (
      <AppSection>
        <p className="text-sm text-ink-500">Loading project…</p>
      </AppSection>
    )
  }

  if (mode === 'error') {
    return (
      <AppSection>
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => navigate(backTarget)}
        >
          ← Back
        </Button>
        <InlineAlert variant="error">{error ?? 'Project not found'}</InlineAlert>
      </AppSection>
    )
  }

  return (
    <AppSection>
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        onClick={() => navigate(backTarget)}
      >
        ← Back
      </Button>

      {error && <InlineAlert variant="error">{error}</InlineAlert>}

      {mode === 'preview' && (
        <InlineAlert variant="info">
          Public preview — milestones and scope only. Apply or accept requires an
          account.
        </InlineAlert>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
          <h1 className="font-display text-2xl font-bold leading-8 text-ink-900 md:text-[36px] md:leading-10">
            {title}
          </h1>
          <StatusBadge status={statusInfo.status} label={statusInfo.label} />
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <Tag key={skill}>{skill}</Tag>
            ))}
          </div>
        )}

        {(project || preview) && (
          <EscrowPill
            label={project ? projectEscrowLabel(project) : 'Escrow-backed'}
            milestoneCount={
              project?.milestones.length ?? preview?.milestones.length
            }
          />
        )}

        {description && (
          <p className="max-w-3xl text-base leading-6 text-ink-600">
            {description}
          </p>
        )}

        {preview && (
          <PartiesBlock
            parties={[
              {
                role: 'Client',
                name: previewClientName(preview),
              },
            ]}
          />
        )}

        <p className="font-mono text-[28px] font-medium leading-[34px] text-ink-900">
          {budget} {currency}
        </p>

        {canInvite && id && (
          <Button
            className="w-full md:w-auto"
            onClick={() => setInviteOpen(true)}
          >
            Invite freelancer
          </Button>
        )}

        {isInvitedFreelancer && (
          <Button
            className="w-full md:w-auto"
            loading={actionLoading}
            onClick={() => void handleAccept()}
          >
            Accept invite
          </Button>
        )}

        {mode === 'preview' && !user && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => navigate(ROUTES.register)}>
              Sign up to apply
            </Button>
            <Button variant="secondary" onClick={() => navigate(ROUTES.login)}>
              Log in
            </Button>
          </div>
        )}

        {mode === 'preview' && preview && (
          <p className="text-sm text-ink-500">
            Posted by{' '}
            <Link
              to={ROUTES.profile(preview.client.id)}
              className="font-medium text-brand-600 hover:underline"
            >
              {previewClientName(preview)}
            </Link>
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <h2 className="text-sm font-medium text-ink-900">Milestones</h2>
        {milestones.map((milestone) => (
          <MilestoneCard
            key={milestone.id ?? milestone.orderIndex}
            title={milestone.title}
            description={milestone.description}
            amount={milestone.amount}
            deadline={formatDeadline(
              typeof milestone.deadline === 'string'
                ? milestone.deadline
                : new Date(milestone.deadline).toISOString(),
            )}
            status={mapMilestoneStatus(milestone.status)}
          />
        ))}
        {milestones.length === 0 && (
          <p className="text-sm text-ink-500">No milestones defined.</p>
        )}
      </div>

      {mode === 'full' && project && canFund && (
        <div className="mt-4">
          <Button
            className="w-full md:w-auto"
            loading={actionLoading}
            onClick={() => void handleFund()}
          >
            Fund project
          </Button>
        </div>
      )}

      {id && (
        <InviteFreelancerModal
          open={inviteOpen}
          projectId={id}
          onClose={closeInviteModal}
          onSuccess={() => void reloadProject()}
        />
      )}
    </AppSection>
  )
}
