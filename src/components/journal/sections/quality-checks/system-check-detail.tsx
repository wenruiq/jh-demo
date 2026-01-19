// System Check Detail Component
// Displays details and actions for a system quality check

import { Check, Loader2, RotateCcw, Server } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { QualityCheck } from "@/store/data-quality-store"
import { useDataQualityStore } from "@/store/data-quality-store"
import { isQualityCheckDone } from "./utils"

interface SystemCheckDetailProps {
  check: QualityCheck
  assetId: string
  readonly?: boolean
}

export function SystemCheckDetail({ check, assetId, readonly = false }: SystemCheckDetailProps) {
  const loading = useDataQualityStore((state) => state.loading)
  const markSuccess = useDataQualityStore((state) => state.markSuccess)
  const acknowledgeCheck = useDataQualityStore((state) => state.acknowledgeCheck)
  const unacknowledgeCheck = useDataQualityStore((state) => state.unacknowledgeCheck)
  const revertUserResult = useDataQualityStore((state) => state.revertUserResult)

  const [attestation, setAttestation] = useState(check.attestation ?? "")
  const [isEditing, setIsEditing] = useState(!check.userResult)

  useEffect(() => {
    setAttestation(check.attestation ?? "")
    setIsEditing(!check.userResult)
  }, [check.attestation, check.userResult])

  const isDone = isQualityCheckDone(check)
  const canAcknowledge = check.systemResult === "Pass" && !check.acknowledged
  const canUnacknowledge = check.systemResult === "Pass" && check.acknowledged

  const handleMarkSuccess = async () => {
    if (!attestation.trim()) {
      return
    }
    await markSuccess(assetId, check.id, attestation)
    setIsEditing(false)
  }

  const handleRevert = async () => {
    await revertUserResult(assetId, check.id)
    setIsEditing(true)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-base">
          <span className="font-bold">{check.assertion}:</span> {check.title}
        </h3>
        <Badge className="mt-1.5" variant="neutral">
          <Server className="mr-1 h-3 w-3" />
          System Check
        </Badge>
      </div>

      <div>
        <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Description
        </p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{check.description}</p>
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            System Result
          </p>
          <Badge variant={check.systemResult === "Pass" ? "success" : "destructive-outline"}>
            {check.systemResult}
          </Badge>
        </div>
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-sm leading-relaxed">{check.systemResultExplanation}</p>
        </div>
      </div>

      {check.systemResult === "Failed" && (
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Attestation
            </p>
            {check.userResult === "Pass" && (
              <div className="flex items-center gap-1">
                <Badge variant="success">Marked Success</Badge>
                {!readonly && (
                  <Button
                    className="h-6 px-1.5 text-[10px]"
                    disabled={loading.revertUserResult === check.id}
                    onClick={handleRevert}
                    size="sm"
                    variant="ghost"
                  >
                    {loading.revertUserResult === check.id ? (
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
                  setAttestation(e.target.value)
                }
                placeholder="Explain why this check should be marked as success..."
                value={attestation}
              />
              <div className="flex justify-end">
                <Button
                  disabled={!attestation.trim() || loading.markSuccess === check.id}
                  onClick={handleMarkSuccess}
                  size="sm"
                >
                  {loading.markSuccess === check.id ? (
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
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-sm leading-relaxed">
                {check.attestation || "No attestation provided"}
              </p>
            </div>
          )}
        </div>
      )}

      {canAcknowledge && !readonly && (
        <div className="flex justify-end border-t pt-4">
          <Button
            disabled={loading.acknowledge === check.id}
            onClick={() => acknowledgeCheck(assetId, check.id)}
            size="sm"
          >
            {loading.acknowledge === check.id ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Acknowledging...
              </>
            ) : (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Acknowledge
              </>
            )}
          </Button>
        </div>
      )}

      {canUnacknowledge && !readonly && (
        <div className="flex justify-end border-t pt-4">
          <Button
            disabled={loading.unacknowledge === check.id}
            onClick={() => unacknowledgeCheck(assetId, check.id)}
            size="sm"
            variant="outline"
          >
            {loading.unacknowledge === check.id ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Reverting...
              </>
            ) : (
              <>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Undo Acknowledge
              </>
            )}
          </Button>
        </div>
      )}

      {isDone && !canUnacknowledge && (
        <div className="flex items-center gap-2 rounded-md bg-success-muted p-3">
          <Check className="h-4 w-4 text-success" />
          <p className="font-medium text-sm text-success">Quality check completed</p>
        </div>
      )}
    </div>
  )
}
