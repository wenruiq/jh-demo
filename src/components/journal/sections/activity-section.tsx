import { SectionContainer } from "@/components/journal/shared/section-container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ActivitySection() {
  return (
    <SectionContainer title="Activity">
      <Tabs defaultValue="comments">
        <TabsList className="h-8">
          <TabsTrigger className="text-xs" value="comments">
            Comments
          </TabsTrigger>
          <TabsTrigger className="text-xs" value="history">
            History
          </TabsTrigger>
          <TabsTrigger className="text-xs" value="enquiry">
            Review Enquiry
          </TabsTrigger>
        </TabsList>
        <TabsContent className="mt-3" value="comments">
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-muted border-dashed">
            <p className="text-muted-foreground text-sm">Comments will be displayed here</p>
          </div>
        </TabsContent>
        <TabsContent className="mt-3" value="history">
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-muted border-dashed">
            <p className="text-muted-foreground text-sm">Activity history will be displayed here</p>
          </div>
        </TabsContent>
        <TabsContent className="mt-3" value="enquiry">
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-muted border-dashed">
            <p className="text-muted-foreground text-sm">Review enquiries will be displayed here</p>
          </div>
        </TabsContent>
      </Tabs>
    </SectionContainer>
  )
}
