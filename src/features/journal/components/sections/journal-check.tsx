import { Check, Filter, Info, Loader2, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AddQualityCheckDialog } from "@/features/journal/components/sections/quality-checks/add-quality-check-dialog"
import { AiCheckDetail } from "@/features/journal/components/sections/quality-checks/ai-check-detail"
import { ManualCheckDetail } from "@/features/journal/components/sections/quality-checks/manual-check-detail"
import { QualityCheckCard } from "@/features/journal/components/sections/quality-checks/quality-check-card"
import { SystemCheckDetail } from "@/features/journal/components/sections/quality-checks/system-check-detail"
import { isQualityCheckDone } from "@/features/journal/components/sections/quality-checks/utils"
import { SectionContainer } from "@/features/journal/components/shared/section-container"
import {
  type Assertion,
  type CheckType,
  useDataQualityStore,
} from "@/features/journal/state/data-quality-store"
import { useJournalStore } from "@/features/journal/state/journal-store"
import { cn } from "@/shared/lib/utils"

interface JournalCheckProps {
  readonly?: boolean
}

export function JournalCheck({ readonly = false }: JournalCheckProps) {
  const selectedAssetId = useJournalStore((state) => state.selectedAssetId)
  const checksByAssetId = useDataQualityStore((state) => state.checksByAssetId)
  const initializeAsset = useDataQualityStore((state) => state.initializeAsset)
  const loading = useDataQualityStore((state) => state.loading)
  const acknowledgeCheck = useDataQualityStore((state) => state.acknowledgeCheck)
  const unacknowledgeCheck = useDataQualityStore((state) => state.unacknowledgeCheck)
  const acknowledgeAll = useDataQualityStore((state) => state.acknowledgeAll)
  const addCheck = useDataQualityStore((state) => state.addCheck)

  const [selectedCheckId, setSelectedCheckId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (selectedAssetId) {
      initializeAsset(selectedAssetId)
    }
  }, [selectedAssetId, initializeAsset])

  const checks = selectedAssetId ? (checksByAssetId[selectedAssetId] ?? []) : []

  const filteredChecks = checks.filter((check) => {
    if (!searchQuery.trim()) {
      return true
    }
    const searchLower = searchQuery.toLowerCase()
    return (
      check.title.toLowerCase().includes(searchLower) ||
      check.assertion.toLowerCase().includes(searchLower)
    )
  })

  useEffect(() => {
    if (filteredChecks.length > 0 && !selectedCheckId) {
      setSelectedCheckId(filteredChecks[0].id)
    }
  }, [filteredChecks, selectedCheckId])

  const selectedCheck = checks.find((c) => c.id === selectedCheckId)

  const handleAcknowledgeAll = async () => {
    if (!selectedAssetId) {
      return
    }
    await acknowledgeAll(selectedAssetId)
  }

  const handleAddCheck = async (checkData: {
    assertion: Assertion
    title: string
    type: CheckType
    description: string
  }) => {
    if (!selectedAssetId) {
      return
    }
    await addCheck(selectedAssetId, checkData)
  }

  const pendingCount = checks.filter((c) => !isQualityCheckDone(c)).length
  const acknowledgeableCount = checks.filter(
    (c) => c.systemResult === "Pass" && !c.acknowledged
  ).length

  return (
    <SectionContainer title="Journal Checks">
      <div
        className={cn("flex overflow-hidden rounded-lg border", readonly && "opacity-80")}
        style={{ height: "520px" }}
      >
        <div className="flex w-[340px] shrink-0 flex-col border-r">
          <div className="flex items-center gap-2 border-b px-2 py-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-7 pl-7 text-xs"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="Search..."
                value={searchQuery}
              />
            </div>
            <Button className="h-7 w-7 shrink-0" size="icon" variant="ghost">
              <Filter className="h-3.5 w-3.5" />
            </Button>
            {!readonly && (
              <>
                <Button
                  className="h-7 px-2 text-xs"
                  disabled={acknowledgeableCount === 0 || loading.acknowledgeAll}
                  onClick={handleAcknowledgeAll}
                  size="sm"
                  variant="ghost"
                >
                  {loading.acknowledgeAll ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      All
                    </>
                  )}
                </Button>
                <AddQualityCheckDialog isLoading={loading.addCheck} onAdd={handleAddCheck} />
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredChecks.length === 0 ? (
              <div className="flex h-full items-center justify-center p-4">
                <p className="text-muted-foreground text-sm">No quality checks found</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredChecks.map((check) => (
                  <QualityCheckCard
                    check={check}
                    isLoading={
                      loading.acknowledge === check.id || loading.unacknowledge === check.id
                    }
                    isSelected={selectedCheckId === check.id}
                    key={check.id}
                    onAcknowledge={
                      selectedAssetId
                        ? () => acknowledgeCheck(selectedAssetId, check.id)
                        : undefined
                    }
                    onClick={() => setSelectedCheckId(check.id)}
                    onUnacknowledge={
                      selectedAssetId
                        ? () => unacknowledgeCheck(selectedAssetId, check.id)
                        : undefined
                    }
                    readonly={readonly}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-t px-3 py-1.5">
            <div className="flex items-center gap-1">
              <p className="text-[11px] text-muted-foreground">
                {pendingCount > 0
                  ? `${pendingCount} check${pendingCount !== 1 ? "s" : ""} pending`
                  : "All checks completed"}
              </p>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 cursor-help text-muted-foreground/60 hover:text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px]" side="top">
                    <p>
                      A check is completed when you acknowledge passed results or mark failed checks
                      as success
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {selectedCheck && selectedCheck.type === "System Check" && (
            <SystemCheckDetail
              assetId={selectedAssetId ?? ""}
              check={selectedCheck}
              readonly={readonly}
            />
          )}
          {selectedCheck && selectedCheck.type === "AI Check" && (
            <AiCheckDetail
              assetId={selectedAssetId ?? ""}
              check={selectedCheck}
              readonly={readonly}
            />
          )}
          {selectedCheck && selectedCheck.type === "Manual Check" && (
            <ManualCheckDetail
              assetId={selectedAssetId ?? ""}
              check={selectedCheck}
              readonly={readonly}
            />
          )}
          {!selectedCheck && (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground text-sm">
                Select a quality check to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </SectionContainer>
  )
}
