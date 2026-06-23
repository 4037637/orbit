export type Plan = 'free' | 'lite' | 'pro'

export const PLANS = {
  free: { name: 'Free',  price: 0,  workspaces: 1,        members: 0 },
  lite: { name: 'Lite',  price: 9,  workspaces: 10,       members: 2 },
  pro:  { name: 'Pro',   price: 29, workspaces: Infinity, members: Infinity },
} satisfies Record<Plan, { name: string; price: number; workspaces: number; members: number }>

export function canCreateWorkspace(plan: Plan, ownedCount: number): boolean {
  return ownedCount < PLANS[plan].workspaces
}

export function canInviteMember(plan: Plan, memberCount: number): boolean {
  return memberCount < PLANS[plan].members
}

export function workspaceLimit(plan: Plan): number | 'unlimited' {
  const limit = PLANS[plan].workspaces
  return limit === Infinity ? 'unlimited' : limit
}

export function memberLimit(plan: Plan): number | 'unlimited' {
  const limit = PLANS[plan].members
  return limit === Infinity ? 'unlimited' : limit
}
