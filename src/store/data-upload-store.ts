import { create } from "zustand"

export const DATA_UPLOAD_TYPES = [
  "Supporting Data (Manual)",
  "Automation File",
  "Supporting Data (System)",
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

interface DataUploadStore {
  uploadsByAssetId: Record<string, DataUpload[]>
  getUploadsForAsset: (assetId: string) => DataUpload[]
  addUpload: (assetId: string, upload: Omit<DataUpload, "id">) => void
  updateUpload: (assetId: string, uploadId: string, updates: Partial<DataUpload>) => void
  deleteUpload: (assetId: string, uploadId: string) => void
  uploadFile: (assetId: string, uploadId: string, fileName: string) => void
  removeFile: (assetId: string, uploadId: string) => void
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
  ]
}

export const useDataUploadStore = create<DataUploadStore>((set, get) => ({
  uploadsByAssetId: {},

  getUploadsForAsset: (assetId: string) => {
    const uploads = get().uploadsByAssetId[assetId]
    if (!uploads) {
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

  addUpload: (assetId: string, upload: Omit<DataUpload, "id">) => {
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
      }
    })
  },

  updateUpload: (assetId: string, uploadId: string, updates: Partial<DataUpload>) => {
    set((state) => {
      const existingUploads = state.uploadsByAssetId[assetId] ?? []
      return {
        uploadsByAssetId: {
          ...state.uploadsByAssetId,
          [assetId]: existingUploads.map((u) => (u.id === uploadId ? { ...u, ...updates } : u)),
        },
      }
    })
  },

  deleteUpload: (assetId: string, uploadId: string) => {
    set((state) => {
      const existingUploads = state.uploadsByAssetId[assetId] ?? []
      return {
        uploadsByAssetId: {
          ...state.uploadsByAssetId,
          [assetId]: existingUploads.filter((u) => u.id !== uploadId),
        },
      }
    })
  },

  uploadFile: (assetId: string, uploadId: string, fileName: string) => {
    set((state) => {
      const existingUploads = state.uploadsByAssetId[assetId] ?? []
      return {
        uploadsByAssetId: {
          ...state.uploadsByAssetId,
          [assetId]: existingUploads.map((u) =>
            u.id === uploadId ? { ...u, fileName, uploadedAt: new Date().toISOString() } : u
          ),
        },
      }
    })
  },

  removeFile: (assetId: string, uploadId: string) => {
    set((state) => {
      const existingUploads = state.uploadsByAssetId[assetId] ?? []
      return {
        uploadsByAssetId: {
          ...state.uploadsByAssetId,
          [assetId]: existingUploads.map((u) =>
            u.id === uploadId ? { ...u, fileName: undefined, uploadedAt: undefined } : u
          ),
        },
      }
    })
  },
}))
