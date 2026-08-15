import axios from 'axios'

export type PlatformStats = {
  openProjects: number
  usdcInEscrow: string
}

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

let inflight: Promise<PlatformStats> | null = null

export const getPlatformStats = () => {
  if (!inflight) {
    inflight = publicApi
      .get<PlatformStats>('/stats')
      .then((res) => res.data)
      .catch((error) => {
        inflight = null
        throw error
      })
  }
  return inflight
}

/** Start the public stats request as soon as the app boots. */
export function prefetchPlatformStats() {
  void getPlatformStats()
}

export function formatUsdcStat(amount: string) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '0'
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export function platformStatLine(stats: PlatformStats) {
  return `${stats.openProjects} open projects · ${formatUsdcStat(stats.usdcInEscrow)} USDC in escrow`
}
