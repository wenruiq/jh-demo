import { Bot, ClipboardCheck, Loader2, Plus, Server } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  ASSERTIONS,
  type Assertion,
  CHECK_TYPES,
  type CheckType,
} from "@/features/journal/state/data-quality-store"

interface AddQualityCheckDialogProps {
  isLoading: boolean
  onAdd: (check: {
    assertion: Assertion
    title: string
    type: CheckType
    description: string
  }) => Promise<void>
}

export function AddQualityCheckDialog({ isLoading, onAdd }: AddQualityCheckDialogProps) {
  const [open, setOpen] = useState(false)
  const [assertion, setAssertion] = useState<Assertion>("Accuracy")
  const [title, setTitle] = useState("")
  const [type, setType] = useState<CheckType>("System Check")
  const [description, setDescription] = useState("")

  const resetForm = () => {
    setAssertion("Accuracy")
    setTitle("")
    setType("System Check")
    setDescription("")
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      return
    }

    await onAdd({
      assertion,
      title: title.trim(),
      type,
      description: description.trim(),
    })

    resetForm()
    setOpen(false)
  }

  const isValid = title.trim().length > 0

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="h-7 px-2 text-xs" size="sm" variant="outline">
          <Plus className="mr-1 h-3 w-3" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Journal Check</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex gap-3">
            <div className="w-[130px] shrink-0 space-y-1.5">
              <Label htmlFor="qc-assertion">Assertion</Label>
              <Select onValueChange={(v) => setAssertion(v as Assertion)} value={assertion}>
                <SelectTrigger className="h-9" id="qc-assertion">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSERTIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="qc-title">Title</Label>
              <Input
                className="h-9"
                id="qc-title"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="e.g., Tie-Out & Reconciliation"
                value={title}
              />
            </div>
          </div>

          <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
            <span className="font-semibold">{assertion}:</span>{" "}
            <span className="text-muted-foreground">{title || "..."}</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qc-type">Type</Label>
            <Select onValueChange={(v) => setType(v as CheckType)} value={type}>
              <SelectTrigger className="h-9" id="qc-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHECK_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    <span className="flex items-center gap-1.5">
                      {t === "AI Check" && <Bot className="h-3.5 w-3.5" />}
                      {t === "System Check" && <Server className="h-3.5 w-3.5" />}
                      {t === "Manual Check" && <ClipboardCheck className="h-3.5 w-3.5" />}
                      {t}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qc-description">Description</Label>
            <Textarea
              className="min-h-[80px]"
              id="qc-description"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              placeholder="Describe what this quality check validates..."
              value={description}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled={!isValid || isLoading} onClick={handleSubmit}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Check"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
