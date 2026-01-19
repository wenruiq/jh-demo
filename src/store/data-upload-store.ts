import { create } from "zustand"

export const DATA_UPLOAD_TYPES = [
  "Supporting Data (Manual)",
  "Automation File",
  "Supporting Data (System)",
  "Raw Data",
] as const

export type DataUploadType = (typeof DATA_UPLOAD_TYPES)[number]

export interface DataUpload {
  id: string
  name: string
  type: DataUploadType
  description: string
  fileName?: string
  uploadedAt?: string
}

interface LoadingState {
  addUpload: boolean
  deleteUpload: string | null // uploadId being deleted
  uploadFile: string | null // uploadId being uploaded to
  deleteFile: string | null // uploadId whose file is being deleted
  updateUpload: string | null // uploadId being updated
}

interface DataUploadStore {
  uploadsByAssetId: Record<string, DataUpload[]>
  loading: LoadingState
  getUploadsForAsset: (assetId: string) => DataUpload[]
  initializeAsset: (assetId: string) => void
  addUpload: (assetId: string, upload: Omit<DataUpload, "id">) => Promise<void>
  updateUpload: (
    assetId: string,
    uploadId: string,
    updates: Partial<Omit<DataUpload, "id">>
  ) => Promise<void>
  deleteUpload: (assetId: string, uploadId: string) => Promise<void>
  uploadFile: (assetId: string, uploadId: string, fileName: string) => Promise<void>
  removeFile: (assetId: string, uploadId: string) => Promise<void>
}

function generateId(): string {
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getDefaultUploads(): DataUpload[] {
  return [
    {
      id: "default-system-1",
      name: "HRIS Claims",
      type: "Supporting Data (System)",
      description: "HRIS Claims Data stored in Data Warehouse, populated from Daily HRIS ingestion",
      fileName: "Data Warehouse - HRIS Claims.parquet",
      uploadedAt: new Date().toISOString(),
    },
    {
      id: "default-manual-1",
      name: "GL Account Reconciliation",
      type: "Supporting Data (Manual)",
      description:
        "Monthly reconciliation report for General Ledger accounts with variance analysis",
      fileName: undefined,
      uploadedAt: undefined,
    },
    {
      id: "default-raw-1",
      name: "Transaction Ledger",
      type: "Raw Data",
      description:
        "Raw transaction data from the general ledger system for the current reporting period",
      fileName: "finance_db.transactions_2024_01",
      uploadedAt: new Date().toISOString(),
    },
  ]
}

// Simulate API delay for demo realism
const simulateApiDelay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms))

export const useDataUploadStore = create<DataUploadStore>((set, get) => ({
  uploadsByAssetId: {},
  loading: {
    addUpload: false,
    deleteUpload: null,
    uploadFile: null,
    deleteFile: null,
    updateUpload: null,
  },

  initializeAsset: (assetId: string) => {
    const uploads = get().uploadsByAssetId[assetId]
    if (!uploads) {
      set((state) => ({
        uploadsByAssetId: {
          ...state.uploadsByAssetId,
          [assetId]: getDefaultUploads(),
        },
      }))
    }
  },

  getUploadsForAsset: (assetId: string) => {
    const uploads = get().uploadsByAssetId[assetId]
    if (!uploads) {
      // Initialize synchronously for first access
      const defaultUploads = getDefaultUploads()
      set((state) => ({
        uploadsByAssetId: {
          ...state.uploadsByAssetId,
          [assetId]: defaultUploads,
        },
      }))
      return defaultUploads
    }
    return uploads
  },

  addUpload: async (assetId: string, upload: Omit<DataUpload, "id">) => {
    set((state) => ({ loading: { ...state.loading, addUpload: true } }))

    await simulateApiDelay(600)

    const newUpload: DataUpload = {
      ...upload,
      id: generateId(),
    }
    set((state) => {
      const existingUploads = state.uploadsByAssetId[assetId] ?? getDefaultUploads()
      return {
        uploadsByAssetId: {
          ...state.uploadsByAssetId,
          [assetId]: [...existingUploads, newUpload],
        },
        loading: { ...state.loading, addUpload: false },
      }
    })
  },

  updateUpload: async (
    assetId: string,
    uploadId: string,
    updates: Partial<Omit<DataUpload, "id">>
  ) => {
    set((state) => ({ loading: { ...state.loading, updateUpload: uploadId } }))

    await simulateApiDelay(500)

    set((state) => {
      const existingUploads = state.uploadsByAssetId[assetId] ?? []
      return {
        uploadsByAssetId: {
          ...state.uploadsByAssetId,
          [assetId]: existingUploads.map((u) => (u.id === uploadId ? { ...u, ...updates } : u)),
        },
        loading: { ...state.loading, updateUpload: null },
      }
    })
  },

  deleteUpload: async (assetId: string, uploadId: string) => {
    set((state) => ({ loading: { ...state.loading, deleteUpload: uploadId } }))

    await simulateApiDelay(500)

    set((state) => {
      const existingUploads = state.uploadsByAssetId[assetId] ?? []
      return {
        uploadsByAssetId: {
          ...state.uploadsByAssetId,
          [assetId]: existingUploads.filter((u) => u.id !== uploadId),
        },
        loading: { ...state.loading, deleteUpload: null },
      }
    })
  },

  uploadFile: async (assetId: string, uploadId: string, fileName: string) => {
    set((state) => ({ loading: { ...state.loading, uploadFile: uploadId } }))

    // Longer delay for file upload simulation
    await simulateApiDelay(800)

    set((state) => {
      const existingUploads = state.uploadsByAssetId[assetId] ?? []
      return {
        uploadsByAssetId: {
          ...state.uploadsByAssetId,
          [assetId]: existingUploads.map((u) =>
            u.id === uploadId ? { ...u, fileName, uploadedAt: new Date().toISOString() } : u
          ),
        },
        loading: { ...state.loading, uploadFile: null },
      }
    })
  },

  removeFile: async (assetId: string, uploadId: string) => {
    set((state) => ({ loading: { ...state.loading, deleteFile: uploadId } }))

    await simulateApiDelay(400)

    set((state) => {
      const existingUploads = state.uploadsByAssetId[assetId] ?? []
      return {
        uploadsByAssetId: {
          ...state.uploadsByAssetId,
          [assetId]: existingUploads.map((u) =>
            u.id === uploadId ? { ...u, fileName: undefined, uploadedAt: undefined } : u
          ),
        },
        loading: { ...state.loading, deleteFile: null },
      }
    })
  },
}))
