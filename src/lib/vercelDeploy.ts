// Consulta o status real do deploy na Vercel para um commit especifico, usado
// pelo painel /editar pra saber quando um "Salvar" acabou de fato de publicar
// (build da Vercel roda em segundo plano depois do commit no GitHub).
const PROJECT_ID = 'prj_XsmLep3LBwVzD7kCRHDOYzoa6fWh'
const TEAM_ID = 'team_ZkNrZwgDIRiP23HrABipyxXA'

export type DeployState = 'PENDING' | 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'

export async function getDeploymentStateForCommit(sha: string, token: string): Promise<DeployState> {
  const url = `https://api.vercel.com/v6/deployments?projectId=${PROJECT_ID}&teamId=${TEAM_ID}&limit=15`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) return 'PENDING'

  const data = (await res.json().catch(() => null)) as { deployments?: Array<{ readyState: string; meta?: { githubCommitSha?: string } }> } | null
  const match = data?.deployments?.find((d) => d.meta?.githubCommitSha === sha)
  if (!match) return 'PENDING'

  const state = match.readyState
  if (state === 'READY' || state === 'ERROR' || state === 'CANCELED' || state === 'QUEUED' || state === 'BUILDING') {
    return state
  }
  return 'PENDING'
}
