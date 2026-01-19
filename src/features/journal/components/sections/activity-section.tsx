import { CornerDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SectionContainer } from "@/features/journal/components/shared/section-container"
import { ThreadsTab } from "@/features/journal/components/threads/threads-tab"

const DEMO_COMMENTS = [
  {
    id: 1,
    author: "Sarah Mitchell",
    avatar: "SM",
    avatarColor: "bg-violet-500",
    timestamp: "2 hours ago",
    content:
      "I've reviewed the debit entries for lines 1-4. The amounts match the supporting documents from the November reconciliation.",
    replies: [
      {
        id: 2,
        author: "David Chen",
        avatar: "DC",
        avatarColor: "bg-blue-500",
        timestamp: "1 hour ago",
        content:
          "Thanks Sarah. I've cross-checked the credit entries as well. Everything looks aligned with the GL accounts.",
      },
      {
        id: 3,
        author: "Sarah Mitchell",
        avatar: "SM",
        avatarColor: "bg-violet-500",
        timestamp: "45 mins ago",
        content: "Great, I'll proceed with the validation then.",
      },
    ],
  },
  {
    id: 4,
    author: "Michael Torres",
    avatar: "MT",
    avatarColor: "bg-emerald-500",
    timestamp: "3 hours ago",
    content:
      "Please note that the tax reclassification entries (lines 5-6) follow the updated Q4 guidelines. Let me know if you need the reference documentation.",
    replies: [],
  },
]

const DEMO_HISTORY = [
  {
    id: 1,
    author: "Sarah Mitchell",
    email: "s.mitchell@company.com",
    action: "Validated Journal Entry, Result: Passed",
    timestamp: "2026-01-08 16:03:13",
  },
  {
    id: 2,
    author: "Sarah Mitchell",
    email: "s.mitchell@company.com",
    action: "Added: Upload File — 'gl_template.xlsx'",
    timestamp: "2026-01-08 15:27:13",
  },
  {
    id: 3,
    author: "David Chen",
    email: "d.chen@company.com",
    action: "Added: Preparer Sarah Mitchell (s.mitchell@company.com)",
    timestamp: "2026-01-07 18:36:44",
  },
  {
    id: 4,
    author: "David Chen",
    email: "d.chen@company.com",
    action: "Added: Reviewer Michael Torres (m.torres@company.com)",
    timestamp: "2026-01-07 18:36:44",
  },
  {
    id: 5,
    author: "system",
    email: "system",
    action: "Created Journal Entry",
    timestamp: "2026-01-07 18:36:44",
  },
]

interface CommentProps {
  author: string
  avatar: string
  avatarColor: string
  timestamp: string
  content: string
  showReply?: boolean
}

function Comment({
  author,
  avatar,
  avatarColor,
  timestamp,
  content,
  showReply = true,
}: CommentProps) {
  return (
    <div className="flex gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-medium text-white text-xs ${avatarColor}`}
      >
        {avatar}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{author}</span>
          <span className="text-muted-foreground text-xs">· {timestamp}</span>
        </div>
        <p className="mt-1 text-sm">{content}</p>
        {showReply && (
          <Button
            className="mt-2 h-7 gap-1.5 px-2 text-muted-foreground text-xs"
            size="sm"
            variant="ghost"
          >
            <CornerDownRight className="h-3 w-3" />
            Reply
          </Button>
        )}
      </div>
    </div>
  )
}

interface HistoryItemProps {
  author: string
  email: string
  action: string
  timestamp: string
}

function HistoryItem({ author, email, action, timestamp }: HistoryItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">
            {author} <span className="font-normal text-muted-foreground">({email})</span>
          </span>
          <span className="text-muted-foreground text-xs">{timestamp}</span>
        </div>
        <p className="mt-0.5 text-muted-foreground text-sm">{action}</p>
      </div>
    </div>
  )
}

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
          <TabsTrigger className="text-xs" value="threads">
            Threads
          </TabsTrigger>
        </TabsList>

        <TabsContent className="mt-4 pb-16" value="comments">
          <div className="space-y-4">
            <div className="flex gap-3 rounded-lg border-2 border-muted border-dashed p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 font-medium text-white text-xs">
                JD
              </div>
              <div className="flex flex-1 items-center text-muted-foreground text-sm">
                What are your thoughts? Click to share...
              </div>
            </div>

            <div className="space-y-4">
              {DEMO_COMMENTS.map((comment) => (
                <div className="rounded-lg border p-4" key={comment.id}>
                  <Comment
                    author={comment.author}
                    avatar={comment.avatar}
                    avatarColor={comment.avatarColor}
                    content={comment.content}
                    timestamp={comment.timestamp}
                  />
                  {comment.replies.length > 0 && (
                    <div className="mt-4 ml-11 space-y-4 border-muted border-l-2 pl-4">
                      {comment.replies.map((reply) => (
                        <Comment
                          author={reply.author}
                          avatar={reply.avatar}
                          avatarColor={reply.avatarColor}
                          content={reply.content}
                          key={reply.id}
                          showReply={false}
                          timestamp={reply.timestamp}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent className="mt-5 pb-16" value="history">
          <div className="space-y-4">
            {DEMO_HISTORY.map((item) => (
              <HistoryItem
                action={item.action}
                author={item.author}
                email={item.email}
                key={item.id}
                timestamp={item.timestamp}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent className="mt-3" value="threads">
          <ThreadsTab />
        </TabsContent>
      </Tabs>
    </SectionContainer>
  )
}
