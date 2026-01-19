import { Loader2, RotateCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { QualityCheck } from "@/features/journal/state/data-quality-store"

interface AiAttestationSectionProps {
  check: QualityCheck
  attestation: string
  isEditing: boolean
  readonly: boolean
  isLoading: boolean
  onAttestationChange: (value: string) => void
  onMarkSuccess: () => Promise<void>
  onRevert: () => Promise<void>
}

export function AiAttestationSection({
  check,
  attestation,
  isEditing,
  readonly,
  isLoading,
  onAttestationChange,
  onMarkSuccess,
  onRevert,
}: AiAttestationSectionProps) {
  if (check.systemResult !== "Failed") {
    return null
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Attestation
        </p>
        {check.userResult === "Pass" && (
          <div className="flex items-center gap-1.5">
            <Badge variant="success">Marked Success</Badge>
            {!readonly && (
              <Button
                className="h-6 px-2 text-[10px]"
                disabled={isLoading}
                onClick={onRevert}
                size="sm"
                variant="ghost"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Revert
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
      {isEditing && !readonly ? (
        <div className="space-y-2">
          <Textarea
            className="min-h-[80px]"
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onAttestationChange(e.target.value)
            }
            placeholder="Explain why this check should be marked as success..."
            value={attestation}
          />
          <div className="flex justify-end">
            <Button disabled={!attestation.trim() || isLoading} onClick={onMarkSuccess} size="sm">
              {isLoading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Mark Success"
              )}
            </Button>
          </div>
        </div>
      ) : (
        check.userResult === "Pass" && (
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-sm leading-relaxed">
              {check.attestation || "No attestation provided"}
            </p>
          </div>
        )
      )}
    </div>
  )
}
