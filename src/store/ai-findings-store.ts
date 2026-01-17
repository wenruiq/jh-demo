import { create } from "zustand"

export type FindingsStatus = "not-started" | "generated" | "finalized"

export interface AiFindings {
  content: string
  generatedAt: Date
}

interface AiFindingsStore {
  // Persisted state
  adoptedFindings: AiFindings | null
  hasGeneratedResponse: boolean
  currentPrompt: string
  currentResponse: string
  // Transient state
  isStreaming: boolean
  // Actions
  setAdoptedFindings: (findings: AiFindings | null) => void
  setHasGeneratedResponse: (hasGenerated: boolean) => void
  setCurrentPrompt: (prompt: string) => void
  setCurrentResponse: (response: string) => void
  setIsStreaming: (streaming: boolean) => void
  clearAdoptedFindings: () => void
  resetForNewGeneration: () => void
  getStatus: () => FindingsStatus
}

export const useAiFindingsStore = create<AiFindingsStore>((set, get) => ({
  adoptedFindings: null,
  hasGeneratedResponse: false,
  currentPrompt: "",
  currentResponse: "",
  isStreaming: false,
  setAdoptedFindings: (findings) => set({ adoptedFindings: findings }),
  setHasGeneratedResponse: (hasGenerated) => set({ hasGeneratedResponse: hasGenerated }),
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  setCurrentResponse: (response) => set({ currentResponse: response }),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  clearAdoptedFindings: () => set({ adoptedFindings: null }),
  resetForNewGeneration: () =>
    set({
      hasGeneratedResponse: false,
      adoptedFindings: null,
      currentResponse: "",
    }),
  getStatus: () => {
    const state = get()
    if (state.adoptedFindings) {
      return "finalized"
    }
    if (state.hasGeneratedResponse) {
      return "generated"
    }
    return "not-started"
  },
}))
