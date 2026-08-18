import { getPlatformStats, type PlatformStats } from '@/lib/stats.api'

export type LandingLoaderData = {
  stats: PlatformStats | null
}

export async function landingLoader(): Promise<LandingLoaderData> {
  try {
    const stats = await getPlatformStats()
    return { stats }
  } catch {
    return { stats: null }
  }
}
