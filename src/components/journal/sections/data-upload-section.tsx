import { CloudUpload, Database, FileSpreadsheet, FileText, Plus, Trash2 } from "lucide-react"
import { useCallback, useState } from "react"
import { SectionContainer } from "@/components/journal/shared/section-container"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { type DataUpload, type DataUploadType, useDataUploadStore } from "@/store/data-upload-store"
import { useJournalStore } from "@/store/journal-store"

interface DataUploadSectionProps {
  readonly?: boolean
}

export function DataUploadSection({ readonly = false }: DataUploadSectionProps) {
  const selectedAssetId = useJournalStore((state) => state.selectedAssetId)
  const { getUploadsForAsset, addUpload, deleteUpload, uploadFile } = useDataUploadStore()

  const uploads = selectedAssetId ? getUploadsForAsset(selectedAssetId) : []

  const handleAddUpload = (data: Omit<DataUpload, "id">) => {
    if (selectedAssetId) {
      addUpload(selectedAssetId, data)
    }
  }

  const handleDelete = (uploadId: string) => {
    if (selectedAssetId) {
      deleteUpload(selectedAssetId, uploadId)
    }
  }

  const handleFileUpload = (uploadId: string, fileName: string) => {
    if (selectedAssetId) {
      uploadFile(selectedAssetId, uploadId, fileName)
    }
  }

  return (
    <SectionContainer title="Data Upload">
      <div className="space-y-3">
        {!readonly && (
          <div className="flex justify-end">
            <AddDataUploadDialog onAdd={handleAddUpload} />
          </div>
        )}

        <div className="max-h-[280px] overflow-y-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
              <tr className="border-b">
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Name</th>
                <th className="w-[160px] px-3 py-2.5 text-left font-medium text-muted-foreground">
                  Type
                </th>
                <th className="w-[200px] px-3 py-2.5 text-left font-medium text-muted-foreground">
                  Description
                </th>
                <th className="w-[180px] px-3 py-2.5 text-left font-medium text-muted-foreground">
                  Preview
                </th>
                {!readonly && (
                  <th className="w-[60px] px-3 py-2.5 text-left font-medium text-muted-foreground">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {uploads.length === 0 ? (
                <tr>
                  <td
                    className="px-3 py-8 text-center text-muted-foreground"
                    colSpan={readonly ? 4 : 5}
                  >
                    No data uploads defined. Click "Add Data Upload" to get started.
                  </td>
                </tr>
              ) : (
                uploads.map((upload) => (
                  <DataUploadRow
                    key={upload.id}
                    onDelete={() => handleDelete(upload.id)}
                    onFileUpload={(fileName) => handleFileUpload(upload.id, fileName)}
                    readonly={readonly}
                    upload={upload}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SectionContainer>
  )
}

interface DataUploadRowProps {
  upload: DataUpload
  readonly: boolean
  onDelete: () => void
  onFileUpload: (fileName: string) => void
}

function DataUploadRow({ upload, readonly, onDelete, onFileUpload }: DataUploadRowProps) {
  const [showFileDialog, setShowFileDialog] = useState(false)

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30">
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <TypeIcon type={upload.type} />
          <span className="font-medium">{upload.name}</span>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <TypeBadge type={upload.type} />
      </td>
      <td className="px-3 py-2.5">
        <p className="line-clamp-2 text-muted-foreground" title={upload.description}>
          {upload.description}
        </p>
      </td>
      <td className="px-3 py-2.5">
        <PreviewCell
          fileName={upload.fileName}
          onFileUpload={onFileUpload}
          readonly={readonly}
          setShowFileDialog={setShowFileDialog}
          showFileDialog={showFileDialog}
          uploadName={upload.name}
        />
      </td>
      {!readonly && (
        <td className="px-3 py-2.5">
          <Button
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            size="icon"
            variant="ghost"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </td>
      )}
    </tr>
  )
}

interface PreviewCellProps {
  fileName?: string
  readonly: boolean
  uploadName: string
  showFileDialog: boolean
  setShowFileDialog: (show: boolean) => void
  onFileUpload: (fileName: string) => void
}

function PreviewCell({
  fileName,
  readonly,
  uploadName,
  showFileDialog,
  setShowFileDialog,
  onFileUpload,
}: PreviewCellProps) {
  if (fileName) {
    return (
      <div className="flex items-center gap-1.5">
        <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate text-xs" title={fileName}>
          {fileName}
        </span>
      </div>
    )
  }

  if (readonly) {
    return <span className="text-muted-foreground text-xs">No file</span>
  }

  return (
    <Dialog onOpenChange={setShowFileDialog} open={showFileDialog}>
      <DialogTrigger asChild>
        <Button className="h-7 gap-1 px-2 text-xs" size="sm" variant="outline">
          <CloudUpload className="h-3 w-3" />
          Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>Upload a file for "{uploadName}"</DialogDescription>
        </DialogHeader>
        <FileDropZone
          onFileSelect={(name) => {
            onFileUpload(name)
            setShowFileDialog(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

function TypeIcon({ type }: { type: DataUploadType }) {
  switch (type) {
    case "Supporting Data (System)":
      return <Database className="h-4 w-4 text-blue-600" />
    case "Automation File":
      return <FileSpreadsheet className="h-4 w-4 text-green-600" />
    default:
      return <FileText className="h-4 w-4 text-orange-600" />
  }
}

function TypeBadge({ type }: { type: DataUploadType }) {
  const styles = {
    "Supporting Data (System)": "bg-blue-50 text-blue-700 border-blue-200",
    "Automation File": "bg-green-50 text-green-700 border-green-200",
    "Supporting Data (Manual)": "bg-orange-50 text-orange-700 border-orange-200",
  }

  const shortLabels = {
    "Supporting Data (System)": "System",
    "Automation File": "Automation",
    "Supporting Data (Manual)": "Manual",
  }

  return (
    <span
      className={cn("inline-flex rounded-md border px-2 py-0.5 font-medium text-xs", styles[type])}
    >
      {shortLabels[type]}
    </span>
  )
}

interface AddDataUploadDialogProps {
  onAdd: (data: Omit<DataUpload, "id">) => void
}

function AddDataUploadDialog({ onAdd }: AddDataUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<DataUploadType>("Supporting Data (Manual)")
  const [description, setDescription] = useState("")
  const [fileName, setFileName] = useState<string | undefined>()

  const isValid = name.trim() && description.trim()

  const handleSubmit = () => {
    if (!isValid) {
      return
    }

    onAdd({
      name: name.trim(),
      type,
      description: description.trim(),
      fileName,
      uploadedAt: fileName ? new Date().toISOString() : undefined,
    })

    setName("")
    setType("Supporting Data (Manual)")
    setDescription("")
    setFileName(undefined)
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setName("")
      setType("Supporting Data (Manual)")
      setDescription("")
      setFileName(undefined)
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button className="gap-1.5" size="sm">
          <Plus className="h-4 w-4" />
          Add Data Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Define Data Upload</DialogTitle>
          <DialogDescription>
            Register a new data upload requirement for this journal entry.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="upload-name">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="upload-name"
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Payroll Report"
              value={name}
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="upload-type">
              Type <span className="text-destructive">*</span>
            </label>
            <Select onValueChange={(v) => setType(v as DataUploadType)} value={type}>
              <SelectTrigger id="upload-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Supporting Data (Manual)">Supporting Data (Manual)</SelectItem>
                <SelectItem value="Automation File">Automation File</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="upload-description">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="upload-description"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this data upload contains..."
              value={description}
            />
          </div>

          <div className="space-y-2">
            <p className="font-medium text-sm">
              File <span className="text-muted-foreground text-xs">(optional)</span>
            </p>
            <FileDropZone onFileSelect={setFileName} selectedFile={fileName} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled={!isValid} onClick={handleSubmit}>
            Add Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface FileDropZoneProps {
  onFileSelect: (fileName: string) => void
  selectedFile?: string
}

function FileDropZone({ onFileSelect, selectedFile }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) {
        onFileSelect(file.name)
      }
    },
    [onFileSelect]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onFileSelect(file.name)
      }
    },
    [onFileSelect]
  )

  if (selectedFile) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/30 p-3">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <span className="flex-1 truncate text-sm">{selectedFile}</span>
        <Button
          className="h-7 px-2 text-xs"
          onClick={() => onFileSelect("")}
          size="sm"
          variant="ghost"
        >
          Remove
        </Button>
      </div>
    )
  }

  const inputId = `file-input-${Math.random().toString(36).slice(2, 9)}`

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Drop zone requires drag event handlers
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Drop zone is interactive via drag-and-drop
    <div
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
      )}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CloudUpload
        className={cn("h-8 w-8", isDragging ? "text-primary" : "text-muted-foreground")}
      />
      <div className="text-center">
        <p className="font-medium text-sm">
          {isDragging ? "Drop file here" : "Drag & drop a file here"}
        </p>
        <p className="text-muted-foreground text-xs">or click to browse</p>
      </div>
      <input className="sr-only" id={inputId} onChange={handleFileInput} type="file" />
      <label className="absolute inset-0 cursor-pointer" htmlFor={inputId}>
        <span className="sr-only">Choose file</span>
      </label>
    </div>
  )
}
