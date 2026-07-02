import axios from 'axios'

export type PlatformStats = {
  openProjects: number
  usdcInEscrow: string
}

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export const getPlatformStats = async () => {
  const res = await publicApi.get<PlatformStats>('/stats')
  return res.data
}

export function formatUsdcStat(amount: string) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '0'
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export function platformStatLine(stats: PlatformStats) {
  return `${stats.openProjects} open projects · ${formatUsdcStat(stats.usdcInEscrow)} USDC in escrow`
}
