import { Shield, Users, FolderKanban } from 'lucide-react'
import { AppSection } from '@/components/layout/AppSection'
import { PageHeader } from '@/components/layout/PageHeader'
import { DashboardSummary } from '@/components/features'
import { EmptyPanel } from '@/components/ui/EmptyPanel'
import { useAuth } from '@/hooks/useAuth'
import { displayName } from '@/lib/projectDisplay'

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <AppSection className="!py-8 md:!py-12">
      <PageHeader
        title={`Welcome, ${user ? displayName(user) : 'Admin'}`}
        action={
          <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            Admin
          </span>
        }
      />

      <DashboardSummary
        stats={[
          { id: 'users', label: 'Total users', value: '—', icon: Users },
          { id: 'projects', label: 'Active projects', value: '—', icon: FolderKanban },
          { id: 'disputes', label: 'Open disputes', value: '0', icon: Shield },
        ]}
      />

      <EmptyPanel
        icon={Shield}
        title="Admin tools coming soon"
        message="User management, dispute resolution, and platform analytics will live here."
      />
    </AppSection>
  )
}
