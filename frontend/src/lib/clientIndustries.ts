/** Client profile industries — stored in the shared `skills` field on User. */
export const CLIENT_INDUSTRIES = [
  'DeFi',
  'NFT & Gaming',
  'Infrastructure',
  'DAOs',
  'Security',
  'Marketing',
] as const

export type ClientIndustry = (typeof CLIENT_INDUSTRIES)[number]

export const MAX_CLIENT_INDUSTRIES = 4
