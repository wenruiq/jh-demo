import type { Identity } from "../types"

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

// Team member with role
export interface TeamMember extends Identity {
  role: "Admin" | "Ops" | "Member"
}

// Mock team members for each team/project combination
export const TEAM_PROJECT_MEMBERS: Record<string, TeamMember[]> = {
  "Singapore/EC-Logistic": [
    {
      id: "sg-ecl-1",
      username: "wei.chen",
      fullname: "Wei Chen",
      avatar: "https://i.pravatar.cc/150?u=wei.chen",
      role: "Admin",
    },
    {
      id: "sg-ecl-2",
      username: "mei.lin",
      fullname: "Mei Lin Tan",
      avatar: "https://i.pravatar.cc/150?u=mei.lin",
      role: "Ops",
    },
    {
      id: "sg-ecl-3",
      username: "raj.kumar",
      fullname: "Raj Kumar",
      avatar: "https://i.pravatar.cc/150?u=raj.kumar",
      role: "Member",
    },
    {
      id: "sg-ecl-4",
      username: "sarah.wong",
      fullname: "Sarah Wong",
      avatar: "https://i.pravatar.cc/150?u=sarah.wong",
      role: "Member",
    },
  ],
  "Singapore/EC-Marketplace": [
    {
      id: "sg-ecm-1",
      username: "david.lim",
      fullname: "David Lim",
      avatar: "https://i.pravatar.cc/150?u=david.lim",
      role: "Admin",
    },
    {
      id: "sg-ecm-2",
      username: "jessica.ng",
      fullname: "Jessica Ng",
      avatar: "https://i.pravatar.cc/150?u=jessica.ng",
      role: "Ops",
    },
    {
      id: "sg-ecm-3",
      username: "michael.teo",
      fullname: "Michael Teo",
      avatar: "https://i.pravatar.cc/150?u=michael.teo",
      role: "Member",
    },
  ],
  "Singapore/GCT": [
    {
      id: "sg-gct-1",
      username: "amanda.lee",
      fullname: "Amanda Lee",
      avatar: "https://i.pravatar.cc/150?u=amanda.lee",
      role: "Admin",
    },
    {
      id: "sg-gct-2",
      username: "kevin.chan",
      fullname: "Kevin Chan",
      avatar: "https://i.pravatar.cc/150?u=kevin.chan",
      role: "Ops",
    },
    {
      id: "sg-gct-3",
      username: "priya.sharma",
      fullname: "Priya Sharma",
      avatar: "https://i.pravatar.cc/150?u=priya.sharma",
      role: "Member",
    },
    {
      id: "sg-gct-4",
      username: "tom.wu",
      fullname: "Tom Wu",
      avatar: "https://i.pravatar.cc/150?u=tom.wu",
      role: "Member",
    },
    {
      id: "sg-gct-5",
      username: "lisa.goh",
      fullname: "Lisa Goh",
      avatar: "https://i.pravatar.cc/150?u=lisa.goh",
      role: "Member",
    },
  ],
  "Indonesia/EC-Marketplace": [
    {
      id: "id-ecm-1",
      username: "budi.santoso",
      fullname: "Budi Santoso",
      avatar: "https://i.pravatar.cc/150?u=budi.santoso",
      role: "Admin",
    },
    {
      id: "id-ecm-2",
      username: "dewi.putri",
      fullname: "Dewi Putri",
      avatar: "https://i.pravatar.cc/150?u=dewi.putri",
      role: "Ops",
    },
    {
      id: "id-ecm-3",
      username: "agus.wijaya",
      fullname: "Agus Wijaya",
      avatar: "https://i.pravatar.cc/150?u=agus.wijaya",
      role: "Member",
    },
  ],
  "Indonesia/DFS": [
    {
      id: "id-dfs-1",
      username: "rina.wati",
      fullname: "Rina Wati",
      avatar: "https://i.pravatar.cc/150?u=rina.wati",
      role: "Admin",
    },
    {
      id: "id-dfs-2",
      username: "hendra.suharto",
      fullname: "Hendra Suharto",
      avatar: "https://i.pravatar.cc/150?u=hendra.suharto",
      role: "Ops",
    },
    {
      id: "id-dfs-3",
      username: "maya.kurnia",
      fullname: "Maya Kurnia",
      avatar: "https://i.pravatar.cc/150?u=maya.kurnia",
      role: "Member",
    },
    {
      id: "id-dfs-4",
      username: "dian.pratama",
      fullname: "Dian Pratama",
      avatar: "https://i.pravatar.cc/150?u=dian.pratama",
      role: "Member",
    },
  ],
  "Indonesia/DE": [
    {
      id: "id-de-1",
      username: "andi.rahman",
      fullname: "Andi Rahman",
      avatar: "https://i.pravatar.cc/150?u=andi.rahman",
      role: "Admin",
    },
    {
      id: "id-de-2",
      username: "siti.nurhaliza",
      fullname: "Siti Nurhaliza",
      avatar: "https://i.pravatar.cc/150?u=siti.nurhaliza",
      role: "Ops",
    },
  ],
  "Thailand/EC-Logistic": [
    {
      id: "th-ecl-1",
      username: "somchai.wong",
      fullname: "Somchai Wong",
      avatar: "https://i.pravatar.cc/150?u=somchai.wong",
      role: "Admin",
    },
    {
      id: "th-ecl-2",
      username: "nattaya.sri",
      fullname: "Nattaya Sri",
      avatar: "https://i.pravatar.cc/150?u=nattaya.sri",
      role: "Ops",
    },
    {
      id: "th-ecl-3",
      username: "prasert.chai",
      fullname: "Prasert Chai",
      avatar: "https://i.pravatar.cc/150?u=prasert.chai",
      role: "Member",
    },
  ],
  "Thailand/EC-Marketplace": [
    {
      id: "th-ecm-1",
      username: "wichai.pong",
      fullname: "Wichai Pong",
      avatar: "https://i.pravatar.cc/150?u=wichai.pong",
      role: "Admin",
    },
    {
      id: "th-ecm-2",
      username: "supaporn.lee",
      fullname: "Supaporn Lee",
      avatar: "https://i.pravatar.cc/150?u=supaporn.lee",
      role: "Ops",
    },
    {
      id: "th-ecm-3",
      username: "anong.kumar",
      fullname: "Anong Kumar",
      avatar: "https://i.pravatar.cc/150?u=anong.kumar",
      role: "Member",
    },
    {
      id: "th-ecm-4",
      username: "tanawat.boon",
      fullname: "Tanawat Boon",
      avatar: "https://i.pravatar.cc/150?u=tanawat.boon",
      role: "Member",
    },
  ],
  "Thailand/DFS": [
    {
      id: "th-dfs-1",
      username: "narong.suk",
      fullname: "Narong Suk",
      avatar: "https://i.pravatar.cc/150?u=narong.suk",
      role: "Admin",
    },
    {
      id: "th-dfs-2",
      username: "pimchanok.art",
      fullname: "Pimchanok Art",
      avatar: "https://i.pravatar.cc/150?u=pimchanok.art",
      role: "Member",
    },
  ],
  "Brazil/EC-Marketplace": [
    {
      id: "br-ecm-1",
      username: "lucas.silva",
      fullname: "Lucas Silva",
      avatar: "https://i.pravatar.cc/150?u=lucas.silva",
      role: "Admin",
    },
    {
      id: "br-ecm-2",
      username: "ana.santos",
      fullname: "Ana Santos",
      avatar: "https://i.pravatar.cc/150?u=ana.santos",
      role: "Ops",
    },
    {
      id: "br-ecm-3",
      username: "pedro.costa",
      fullname: "Pedro Costa",
      avatar: "https://i.pravatar.cc/150?u=pedro.costa",
      role: "Member",
    },
  ],
  "Brazil/DE": [
    {
      id: "br-de-1",
      username: "maria.oliveira",
      fullname: "Maria Oliveira",
      avatar: "https://i.pravatar.cc/150?u=maria.oliveira",
      role: "Admin",
    },
    {
      id: "br-de-2",
      username: "joao.ferreira",
      fullname: "João Ferreira",
      avatar: "https://i.pravatar.cc/150?u=joao.ferreira",
      role: "Ops",
    },
    {
      id: "br-de-3",
      username: "camila.lima",
      fullname: "Camila Lima",
      avatar: "https://i.pravatar.cc/150?u=camila.lima",
      role: "Member",
    },
    {
      id: "br-de-4",
      username: "rafael.souza",
      fullname: "Rafael Souza",
      avatar: "https://i.pravatar.cc/150?u=rafael.souza",
      role: "Member",
    },
  ],
  "Brazil/FRA": [
    {
      id: "br-fra-1",
      username: "juliana.rocha",
      fullname: "Juliana Rocha",
      avatar: "https://i.pravatar.cc/150?u=juliana.rocha",
      role: "Admin",
    },
    {
      id: "br-fra-2",
      username: "gabriel.alves",
      fullname: "Gabriel Alves",
      avatar: "https://i.pravatar.cc/150?u=gabriel.alves",
      role: "Member",
    },
  ],
  "HQ/GCT": [
    {
      id: "hq-gct-1",
      username: "james.chen",
      fullname: "James Chen",
      avatar: "https://i.pravatar.cc/150?u=james.chen",
      role: "Admin",
    },
    {
      id: "hq-gct-2",
      username: "emily.zhang",
      fullname: "Emily Zhang",
      avatar: "https://i.pravatar.cc/150?u=emily.zhang",
      role: "Ops",
    },
    {
      id: "hq-gct-3",
      username: "alex.koh",
      fullname: "Alex Koh",
      avatar: "https://i.pravatar.cc/150?u=alex.koh",
      role: "Ops",
    },
    {
      id: "hq-gct-4",
      username: "rachel.tan",
      fullname: "Rachel Tan",
      avatar: "https://i.pravatar.cc/150?u=rachel.tan",
      role: "Member",
    },
    {
      id: "hq-gct-5",
      username: "daniel.lee",
      fullname: "Daniel Lee",
      avatar: "https://i.pravatar.cc/150?u=daniel.lee",
      role: "Member",
    },
    {
      id: "hq-gct-6",
      username: "sophie.lim",
      fullname: "Sophie Lim",
      avatar: "https://i.pravatar.cc/150?u=sophie.lim",
      role: "Member",
    },
  ],
  "HQ/DFS": [
    {
      id: "hq-dfs-1",
      username: "andrew.wong",
      fullname: "Andrew Wong",
      avatar: "https://i.pravatar.cc/150?u=andrew.wong",
      role: "Admin",
    },
    {
      id: "hq-dfs-2",
      username: "michelle.ong",
      fullname: "Michelle Ong",
      avatar: "https://i.pravatar.cc/150?u=michelle.ong",
      role: "Ops",
    },
    {
      id: "hq-dfs-3",
      username: "steven.ho",
      fullname: "Steven Ho",
      avatar: "https://i.pravatar.cc/150?u=steven.ho",
      role: "Member",
    },
  ],
  "HQ/FRA": [
    {
      id: "hq-fra-1",
      username: "jennifer.chua",
      fullname: "Jennifer Chua",
      avatar: "https://i.pravatar.cc/150?u=jennifer.chua",
      role: "Admin",
    },
    {
      id: "hq-fra-2",
      username: "ryan.yeo",
      fullname: "Ryan Yeo",
      avatar: "https://i.pravatar.cc/150?u=ryan.yeo",
      role: "Ops",
    },
    {
      id: "hq-fra-3",
      username: "grace.ng",
      fullname: "Grace Ng",
      avatar: "https://i.pravatar.cc/150?u=grace.ng",
      role: "Member",
    },
    {
      id: "hq-fra-4",
      username: "marcus.tan",
      fullname: "Marcus Tan",
      avatar: "https://i.pravatar.cc/150?u=marcus.tan",
      role: "Member",
    },
  ],
}

// Get team members for a specific team/project
export function getTeamMembers(team: string, project: string): TeamMember[] {
  return TEAM_PROJECT_MEMBERS[`${team}/${project}`] ?? []
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
