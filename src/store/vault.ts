import { create } from "zustand"

export interface ApiKey {
  id: string
  projectId: string
  serviceName: string
  serviceLogoUrl?: string
  label: string
  encryptedValue: string
  environment: "development" | "staging" | "production"
  tags: string[]
  description?: string
  docsUrl?: string
  expiryDate?: string
  lastCopiedAt?: string
  createdAt: string
  updatedAt: string
  archived: boolean
  favorite: boolean
}

export interface Project {
  id: string
  name: string
  color: string
  icon: string
  createdAt: string
  encryptedProjectKey?: string
}

interface VaultState {
  keys: ApiKey[]
  projects: Project[]
  selectedKeyId: string | null
  searchQuery: string
  filterEnvironment: string | null
  filterProject: string | null

  setKeys: (keys: ApiKey[]) => void
  addKey: (key: ApiKey) => void
  updateKey: (id: string, updates: Partial<ApiKey>) => void
  removeKey: (id: string) => void
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  selectKey: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setFilterEnvironment: (env: string | null) => void
  setFilterProject: (id: string | null) => void
  removeProject: (id: string) => void
  clearVault: () => void
}

export const useVaultStore = create<VaultState>((set) => ({
  keys: [],
  projects: [],
  selectedKeyId: null,
  searchQuery: "",
  filterEnvironment: null,
  filterProject: null,

  setKeys: (keys) => set({ keys }),
  addKey: (key) => set((state) => ({ keys: [key, ...state.keys] })),
  updateKey: (id, updates) =>
    set((state) => ({
      keys: state.keys.map((k) => (k.id === id ? { ...k, ...updates } : k)),
    })),
  removeKey: (id) =>
    set((state) => ({
      keys: state.keys.filter((k) => k.id !== id),
    })),
  setProjects: (projects) => set({ projects }),
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  selectKey: (id) => set({ selectedKeyId: id }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterEnvironment: (filterEnvironment) => set({ filterEnvironment }),
  setFilterProject: (filterProject) => set({ filterProject }),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      keys: state.keys.filter((k) => k.projectId !== id),
    })),
  clearVault: () => set({
    keys: [],
    projects: [],
    selectedKeyId: null,
    searchQuery: "",
    filterEnvironment: null,
    filterProject: null,
  }),
}))
