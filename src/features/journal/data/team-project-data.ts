// Teams
export const TEAMS = ["Singapore", "Indonesia", "Thailand", "Brazil", "HQ"] as const
export type Team = (typeof TEAMS)[number]

// Projects
export const PROJECTS = ["EC-Logistic", "EC-Marketplace", "GCT", "DFS", "DE", "FRA"] as const
export type Project = (typeof PROJECTS)[number]

// Team to project mapping
export const TEAM_PROJECT_MAP: Record<Team, Project[]> = {
  Singapore: ["EC-Logistic", "EC-Marketplace", "GCT"],
  Indonesia: ["EC-Marketplace", "DFS", "DE"],
  Thailand: ["EC-Logistic", "EC-Marketplace", "DFS"],
  Brazil: ["EC-Marketplace", "DE", "FRA"],
  HQ: ["GCT", "DFS", "FRA"],
}

// Get all team-project pairs for a specific team
export function getProjectsForTeam(team: Team): Project[] {
  return TEAM_PROJECT_MAP[team] ?? []
}

// Get all unique team-project pairs
export function getAllTeamProjects(): Array<{ team: Team; project: Project }> {
  const pairs: Array<{ team: Team; project: Project }> = []
  for (const team of TEAMS) {
    for (const project of TEAM_PROJECT_MAP[team]) {
      pairs.push({ team, project })
    }
  }
  return pairs
}

// Check if a project belongs to a team
export function isProjectInTeam(team: Team, project: Project): boolean {
  return TEAM_PROJECT_MAP[team]?.includes(project) ?? false
}
