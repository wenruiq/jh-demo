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

// Pre-populated uploads for asset-002 (Q4 Accounts Receivable Adjustment) - all files uploaded
function getAsset002Uploads(): DataUpload[] {
  return [
    {
      id: "asset002-system-1",
      name: "AR Aging Report",
      type: "Supporting Data (System)",
      description: "Accounts Receivable aging report from ERP system with customer breakdown",
      fileName: "AR_Aging_Q4_2025.xlsx",
      uploadedAt: "2025-01-18T09:30:00Z",
    },
    {
      id: "asset002-manual-1",
      name: "Customer Payment History",
      type: "Supporting Data (Manual)",
      description: "Historical payment patterns for top 50 customers used in allowance calculation",
      fileName: "Customer_Payment_History_2025.csv",
      uploadedAt: "2025-01-18T10:15:00Z",
    },
    {
      id: "asset002-raw-1",
      name: "Invoice Transaction Detail",
      type: "Raw Data",
      description: "Detailed invoice transactions for Q4 2025 from billing system",
      fileName: "invoice_transactions_q4_2025.parquet",
      uploadedAt: "2025-01-18T08:45:00Z",
    },
    {
      id: "asset002-manual-2",
      name: "Bad Debt Allowance Calculation",
      type: "Supporting Data (Manual)",
      description: "Workpaper showing calculation methodology for bad debt allowance adjustment",
      fileName: "Bad_Debt_Allowance_Calc_Q4.xlsx",
      uploadedAt: "2025-01-19T11:20:00Z",
    },
  ]
}

// Initial uploads pre-populated for specific assets
const INITIAL_UPLOADS: Record<string, DataUpload[]> = {
  "asset-002": getAsset002Uploads(),
}

// Simulate API delay for demo realism
const simulateApiDelay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms))

function getUploadsForAssetId(assetId: string): DataUpload[] {
  return INITIAL_UPLOADS[assetId] ?? getDefaultUploads()
}

export const useDataUploadStore = create<DataUploadStore>((set, get) => ({
  uploadsByAssetId: { ...INITIAL_UPLOADS },
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
          [assetId]: getUploadsForAssetId(assetId),
        },
      }))
    }
  },

  getUploadsForAsset: (assetId: string) => {
    const uploads = get().uploadsByAssetId[assetId]
    if (!uploads) {
      // Initialize synchronously for first access
      const assetUploads = getUploadsForAssetId(assetId)
      set((state) => ({
        uploadsByAssetId: {
          ...state.uploadsByAssetId,
          [assetId]: assetUploads,
        },
      }))
      return assetUploads
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
      const existingUploads = state.uploadsByAssetId[assetId] ?? getUploadsForAssetId(assetId)
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
