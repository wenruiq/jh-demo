import type { QueryClient } from "@tanstack/react-query"
import { assetDetailQueryKey } from "@/features/journal/api/queries"
import type { UpdateAssetStatusResponse } from "@/features/journal/types"

export function syncAssetQueries(
  queryClient: QueryClient,
  assetId: string,
  data: UpdateAssetStatusResponse
) {
  queryClient.setQueryData(assetDetailQueryKey(assetId), data)
  queryClient.invalidateQueries({ queryKey: ["assets"] })
}
