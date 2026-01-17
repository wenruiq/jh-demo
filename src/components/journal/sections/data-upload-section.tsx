import {
  CloudUpload,
  Download,
  Edit2,
  FileText,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  const uploadsByAssetId = useDataUploadStore((state) => state.uploadsByAssetId)
  const initializeAsset = useDataUploadStore((state) => state.initializeAsset)
  const addUpload = useDataUploadStore((state) => state.addUpload)
  const updateUpload = useDataUploadStore((state) => state.updateUpload)
  const deleteUpload = useDataUploadStore((state) => state.deleteUpload)
  const uploadFile = useDataUploadStore((state) => state.uploadFile)
  const removeFile = useDataUploadStore((state) => state.removeFile)
  const loading = useDataUploadStore((state) => state.loading)

  useEffect(() => {
    if (selectedAssetId) {
      initializeAsset(selectedAssetId)
    }
  }, [selectedAssetId, initializeAsset])

  const uploads = selectedAssetId ? (uploadsByAssetId[selectedAssetId] ?? []) : []

  const handleAddUpload = async (data: Omit<DataUpload, "id">) => {
    if (selectedAssetId) {
      await addUpload(selectedAssetId, data)
    }
  }

  const handleUpdateUpload = async (uploadId: string, updates: Partial<Omit<DataUpload, "id">>) => {
    if (selectedAssetId) {
      await updateUpload(selectedAssetId, uploadId, updates)
    }
  }

  const handleDelete = async (uploadId: string) => {
    if (selectedAssetId) {
      await deleteUpload(selectedAssetId, uploadId)
    }
  }

  const handleFileUpload = async (uploadId: string, fileName: string) => {
    if (selectedAssetId) {
      await uploadFile(selectedAssetId, uploadId, fileName)
    }
  }

  const handleRemoveFile = async (uploadId: string) => {
    if (selectedAssetId) {
      await removeFile(selectedAssetId, uploadId)
    }
  }

  return (
    <SectionContainer
      headerAction={
        !readonly && <AddDataUploadDialog isLoading={loading.addUpload} onAdd={handleAddUpload} />
      }
      title="Data Upload"
    >
      <div className="max-h-[280px] overflow-y-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
            <tr className="border-b">
              <th className="w-[160px] px-3 py-2.5 text-left font-medium text-muted-foreground">
                Name
              </th>
              <th className="w-[200px] px-3 py-2.5 text-left font-medium text-muted-foreground">
                Type
              </th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                Description
              </th>
              <th className="w-[180px] px-3 py-2.5 text-left font-medium text-muted-foreground">
                Preview
              </th>
              {!readonly && (
                <th className="w-[48px] px-3 py-2.5 text-left font-medium text-muted-foreground">
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
                  No data uploads defined. Click "Add" to get started.
                </td>
              </tr>
            ) : (
              uploads.map((upload) => (
                <DataUploadRow
                  isDeleting={loading.deleteUpload === upload.id}
                  isDeletingFile={loading.deleteFile === upload.id}
                  isUpdating={loading.updateUpload === upload.id}
                  isUploadingFile={loading.uploadFile === upload.id}
                  key={upload.id}
                  onDelete={() => handleDelete(upload.id)}
                  onFileUpload={(fileName) => handleFileUpload(upload.id, fileName)}
                  onRemoveFile={() => handleRemoveFile(upload.id)}
                  onUpdate={(updates) => handleUpdateUpload(upload.id, updates)}
                  readonly={readonly}
                  upload={upload}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </SectionContainer>
  )
}

interface DataUploadRowProps {
  upload: DataUpload
  readonly: boolean
  isDeleting: boolean
  isUploadingFile: boolean
  isDeletingFile: boolean
  isUpdating: boolean
  onDelete: () => Promise<void>
  onFileUpload: (fileName: string) => Promise<void>
  onRemoveFile: () => Promise<void>
  onUpdate: (updates: Partial<Omit<DataUpload, "id">>) => Promise<void>
}

function DataUploadRow({
  upload,
  readonly,
  isDeleting,
  isUploadingFile,
  isDeletingFile,
  isUpdating,
  onDelete,
  onFileUpload,
  onRemoveFile,
  onUpdate,
}: DataUploadRowProps) {
  const [showFileDialog, setShowFileDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDeleteConfirm = async () => {
    await onDelete()
    setShowDeleteConfirm(false)
  }

  const isRowBusy = isDeleting || isUploadingFile || isDeletingFile || isUpdating

  return (
    <tr
      className={cn(
        "border-b last:border-0 hover:bg-muted/30",
        isRowBusy && "pointer-events-none opacity-60"
      )}
    >
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium" title={upload.name}>
            {upload.name}
          </span>
          {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        </div>
      </td>
      <td className="px-3 py-2.5">
        <span className="text-muted-foreground text-xs">{upload.type}</span>
      </td>
      <td className="px-3 py-2.5">
        <p className="line-clamp-2 text-muted-foreground" title={upload.description}>
          {upload.description}
        </p>
      </td>
      <td className="px-3 py-2.5">
        <PreviewCell
          fileName={upload.fileName}
          isDeletingFile={isDeletingFile}
          isUploadingFile={isUploadingFile}
          onFileUpload={onFileUpload}
          onRemoveFile={onRemoveFile}
          readonly={readonly}
          setShowFileDialog={setShowFileDialog}
          showFileDialog={showFileDialog}
          uploadName={upload.name}
        />
      </td>
      {!readonly && (
        <td className="px-3 py-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-7 w-7 text-muted-foreground"
                disabled={isRowBusy}
                size="icon"
                variant="ghost"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit2 className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} variant="destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit Dialog */}
          <EditDataUploadDialog
            isLoading={isUpdating}
            isUploadingFile={isUploadingFile}
            onFileUpload={onFileUpload}
            onOpenChange={setShowEditDialog}
            onRemoveFile={onRemoveFile}
            onUpdate={onUpdate}
            open={showEditDialog}
            upload={upload}
          />

          {/* Delete Confirmation Dialog */}
          <Dialog onOpenChange={setShowDeleteConfirm} open={showDeleteConfirm}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Data Upload</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{upload.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button disabled={isDeleting} variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button disabled={isDeleting} onClick={handleDeleteConfirm} variant="destructive">
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
  onFileUpload: (fileName: string) => Promise<void>
  onRemoveFile: () => Promise<void>
  isUploadingFile: boolean
  isDeletingFile: boolean
}

function PreviewCell({
  fileName,
  readonly,
  uploadName,
  showFileDialog,
  setShowFileDialog,
  onFileUpload,
  onRemoveFile,
  isUploadingFile,
  isDeletingFile,
}: PreviewCellProps) {
  const [showDeleteFileConfirm, setShowDeleteFileConfirm] = useState(false)

  const handleDeleteFile = async () => {
    await onRemoveFile()
    setShowDeleteFileConfirm(false)
  }

  if (fileName) {
    return (
      <div className="flex items-center gap-1.5">
        <Download className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <button
          className="flex-1 truncate text-left text-primary text-xs underline-offset-2 hover:underline"
          onClick={(e) => e.preventDefault()}
          title={`Download ${fileName}`}
          type="button"
        >
          {fileName}
        </button>
        {!readonly && (
          <>
            <Button
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              disabled={isDeletingFile}
              onClick={() => setShowDeleteFileConfirm(true)}
              size="icon"
              variant="ghost"
            >
              {isDeletingFile ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
            </Button>

            {/* Delete File Confirmation */}
            <Dialog onOpenChange={setShowDeleteFileConfirm} open={showDeleteFileConfirm}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Remove File</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove "{fileName}"? You can upload a new file later.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button disabled={isDeletingFile} variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    disabled={isDeletingFile}
                    onClick={handleDeleteFile}
                    variant="destructive"
                  >
                    {isDeletingFile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Remove
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    )
  }

  if (readonly) {
    return <span className="text-muted-foreground text-xs italic">No file</span>
  }

  return (
    <Dialog onOpenChange={setShowFileDialog} open={showFileDialog}>
      <DialogTrigger asChild>
        <Button
          className="h-7 gap-1 px-2 text-xs"
          disabled={isUploadingFile}
          size="sm"
          variant="outline"
        >
          {isUploadingFile ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CloudUpload className="h-3 w-3" />
          )}
          {isUploadingFile ? "Uploading..." : "Upload"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>Upload a file for "{uploadName}"</DialogDescription>
        </DialogHeader>
        <FileDropZone
          isUploading={isUploadingFile}
          onFileSelect={async (name) => {
            await onFileUpload(name)
            setShowFileDialog(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

interface AddDataUploadDialogProps {
  onAdd: (data: Omit<DataUpload, "id">) => Promise<void>
  isLoading: boolean
}

function AddDataUploadDialog({ onAdd, isLoading }: AddDataUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<DataUploadType>("Supporting Data (Manual)")
  const [description, setDescription] = useState("")
  const [fileName, setFileName] = useState<string | undefined>()

  const isValid = name.trim() && description.trim()

  const handleSubmit = async () => {
    if (!isValid) {
      return
    }

    await onAdd({
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
    if (isLoading) {
      return
    }
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
        <Button className="h-7 gap-1.5 px-2.5 text-xs" size="sm" variant="outline">
          <Plus className="h-3.5 w-3.5" />
          Add
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
              disabled={isLoading}
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
            <Select
              disabled={isLoading}
              onValueChange={(v) => setType(v as DataUploadType)}
              value={type}
            >
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
              disabled={isLoading}
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
            <FileDropZone
              isUploading={isLoading}
              onFileSelect={setFileName}
              selectedFile={fileName}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isLoading} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button disabled={!isValid || isLoading} onClick={handleSubmit}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface EditDataUploadDialogProps {
  upload: DataUpload
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (updates: Partial<Omit<DataUpload, "id">>) => Promise<void>
  onFileUpload: (fileName: string) => Promise<void>
  onRemoveFile: () => Promise<void>
  isLoading: boolean
  isUploadingFile: boolean
}

function EditDataUploadDialog({
  upload,
  open,
  onOpenChange,
  onUpdate,
  onFileUpload,
  onRemoveFile,
  isLoading,
  isUploadingFile,
}: EditDataUploadDialogProps) {
  const [name, setName] = useState(upload.name)
  const [type, setType] = useState<DataUploadType>(upload.type)
  const [description, setDescription] = useState(upload.description)
  const [pendingFileName, setPendingFileName] = useState<string | undefined>(upload.fileName)

  // Reset form when upload changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(upload.name)
      setType(upload.type)
      setDescription(upload.description)
      setPendingFileName(upload.fileName)
    }
  }, [open, upload])

  const isValid = name.trim() && description.trim()
  const hasMetadataChanges =
    name.trim() !== upload.name || type !== upload.type || description.trim() !== upload.description
  const hasFileChanges = pendingFileName !== upload.fileName

  const handleSubmit = async () => {
    if (!isValid) {
      return
    }

    // Update metadata if changed
    if (hasMetadataChanges) {
      await onUpdate({
        name: name.trim(),
        type,
        description: description.trim(),
      })
    }

    // Handle file changes
    if (hasFileChanges) {
      if (pendingFileName && !upload.fileName) {
        // New file upload
        await onFileUpload(pendingFileName)
      } else if (!pendingFileName && upload.fileName) {
        // File removed
        await onRemoveFile()
      } else if (pendingFileName && upload.fileName && pendingFileName !== upload.fileName) {
        // File replaced
        await onRemoveFile()
        await onFileUpload(pendingFileName)
      }
    }

    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (isLoading || isUploadingFile) {
      return
    }
    onOpenChange(newOpen)
  }

  // Don't allow editing system types
  if (upload.type === "Supporting Data (System)") {
    return (
      <Dialog onOpenChange={handleOpenChange} open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cannot Edit System Data</DialogTitle>
            <DialogDescription>
              System data uploads are automatically managed and cannot be edited.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const isBusy = isLoading || isUploadingFile
  const canSave = isValid && (hasMetadataChanges || hasFileChanges)

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Data Upload</DialogTitle>
          <DialogDescription>Update the data upload definition.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="edit-upload-name">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              disabled={isBusy}
              id="edit-upload-name"
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Payroll Report"
              value={name}
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="edit-upload-type">
              Type <span className="text-destructive">*</span>
            </label>
            <Select
              disabled={isBusy}
              onValueChange={(v) => setType(v as DataUploadType)}
              value={type}
            >
              <SelectTrigger id="edit-upload-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Supporting Data (Manual)">Supporting Data (Manual)</SelectItem>
                <SelectItem value="Automation File">Automation File</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="edit-upload-description">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isBusy}
              id="edit-upload-description"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this data upload contains..."
              value={description}
            />
          </div>

          <div className="space-y-2">
            <p className="font-medium text-sm">File</p>
            <FileDropZone
              isUploading={isBusy}
              onFileSelect={setPendingFileName}
              selectedFile={pendingFileName}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isBusy} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button disabled={!canSave || isBusy} onClick={handleSubmit}>
            {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface FileDropZoneProps {
  onFileSelect: (fileName: string) => void | Promise<void>
  selectedFile?: string
  isUploading?: boolean
}

function FileDropZone({ onFileSelect, selectedFile, isUploading }: FileDropZoneProps) {
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
      if (file && !isUploading) {
        onFileSelect(file.name)
      }
    },
    [onFileSelect, isUploading]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && !isUploading) {
        onFileSelect(file.name)
      }
    },
    [onFileSelect, isUploading]
  )

  if (selectedFile) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/30 p-3">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <span className="flex-1 truncate text-sm">{selectedFile}</span>
        <Button
          className="h-7 px-2 text-xs"
          disabled={isUploading}
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
        isUploading && "pointer-events-none opacity-50",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
      )}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isUploading ? (
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      ) : (
        <CloudUpload
          className={cn("h-8 w-8", isDragging ? "text-primary" : "text-muted-foreground")}
        />
      )}
      <div className="text-center">
        <p className="font-medium text-sm">
          {isUploading && "Uploading..."}
          {!isUploading && isDragging && "Drop file here"}
          {!(isUploading || isDragging) && "Drag & drop a file here"}
        </p>
        {!isUploading && <p className="text-muted-foreground text-xs">or click to browse</p>}
      </div>
      <input
        className="sr-only"
        disabled={isUploading}
        id={inputId}
        onChange={handleFileInput}
        type="file"
      />
      <label className="absolute inset-0 cursor-pointer" htmlFor={inputId}>
        <span className="sr-only">Choose file</span>
      </label>
    </div>
  )
}
