import { create } from "zustand"

export type ThreadStatus = "open" | "resolved"

export interface ThreadAttachment {
  id: string
  filename: string
  size: string
}

export interface ThreadAuthor {
  name: string
  avatar: string
  avatarColor: string
}

export interface ThreadReply {
  id: string
  threadId: string
  author: ThreadAuthor
  content: string
  attachments: ThreadAttachment[]
  createdAt: Date
  isAccepted: boolean
}

export interface Thread {
  id: string
  title: string
  description: string
  status: ThreadStatus
  author: ThreadAuthor
  createdAt: Date
  replies: ThreadReply[]
  acceptedReplyId: string | null
}

interface LoadingState {
  createThread: boolean
  addReply: string | null // threadId being replied to
  acceptReply: string | null // replyId being accepted
  resolveThread: string | null // threadId being resolved
  reopenThread: string | null // threadId being reopened
}

interface ThreadsStore {
  threads: Thread[]
  selectedThreadId: string | null
  loading: LoadingState
  setSelectedThreadId: (id: string | null) => void
  createThread: (title: string, description: string) => Promise<void>
  addReply: (threadId: string, content: string, attachments?: ThreadAttachment[]) => Promise<void>
  acceptReply: (threadId: string, replyId: string) => Promise<void>
  unacceptReply: (threadId: string, replyId: string) => Promise<void>
  resolveThread: (threadId: string) => Promise<void>
  reopenThread: (threadId: string) => Promise<void>
}

function generateId(): string {
  return `th-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// Simulate API delay for demo realism
const simulateApiDelay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))

// Current user for demo
const CURRENT_USER: ThreadAuthor = {
  name: "John Davis",
  avatar: "JD",
  avatarColor: "bg-sky-500",
}

// Demo seed data
const DEMO_THREADS: Thread[] = [
  {
    id: "thread-1",
    title: "Variance in Account 4500-01 exceeds threshold",
    description:
      "The variance analysis shows Account 4500-01 has a 7.2% deviation from the expected amount. This exceeds our standard 5% threshold. Can someone please provide supporting documentation or explanation for this variance?",
    status: "open",
    author: {
      name: "Michael Torres",
      avatar: "MT",
      avatarColor: "bg-amber-500",
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    replies: [
      {
        id: "reply-1",
        threadId: "thread-1",
        author: {
          name: "Sarah Mitchell",
          avatar: "SM",
          avatarColor: "bg-violet-500",
        },
        content:
          "I've checked the source data. The variance is due to a timing difference in the accrual recognition. The invoice was dated Dec 31 but posted on Jan 2.",
        attachments: [{ id: "att-1", filename: "invoice_timing_analysis.xlsx", size: "245 KB" }],
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        isAccepted: false,
      },
      {
        id: "reply-2",
        threadId: "thread-1",
        author: {
          name: "David Chen",
          avatar: "DC",
          avatarColor: "bg-blue-500",
        },
        content:
          "Thanks Sarah. I've reviewed the timing analysis. This aligns with our cutoff procedures. @Michael, would this explanation suffice for the review?",
        attachments: [],
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
        isAccepted: false,
      },
    ],
    acceptedReplyId: null,
  },
  {
    id: "thread-2",
    title: "Missing supporting document for reclassification entry",
    description:
      "Line 23 contains a reclassification entry but I cannot find the supporting memo in the attachments. Please upload the required documentation.",
    status: "resolved",
    author: {
      name: "Michael Torres",
      avatar: "MT",
      avatarColor: "bg-amber-500",
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    replies: [
      {
        id: "reply-3",
        threadId: "thread-2",
        author: {
          name: "Sarah Mitchell",
          avatar: "SM",
          avatarColor: "bg-violet-500",
        },
        content:
          "Apologies for the oversight. I've now uploaded the reclassification memo approved by the Controller on Dec 28.",
        attachments: [{ id: "att-2", filename: "reclass_memo_dec28.pdf", size: "1.2 MB" }],
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
        isAccepted: true,
      },
    ],
    acceptedReplyId: "reply-3",
  },
  {
    id: "thread-3",
    title: "Duplicate entry detected in cost center 7200",
    description:
      "Lines 45 and 47 appear to be duplicate postings for the same vendor invoice #INV-2024-8834. Please verify and confirm if one should be reversed.",
    status: "open",
    author: {
      name: "Lisa Wong",
      avatar: "LW",
      avatarColor: "bg-rose-500",
    },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    replies: [],
    acceptedReplyId: null,
  },
  {
    id: "thread-4",
    title: "Intercompany balance discrepancy",
    description:
      "The intercompany receivable balance for entity 1200 does not match the corresponding payable in entity 1300. Difference of $12,450.00 needs investigation.",
    status: "open",
    author: {
      name: "David Chen",
      avatar: "DC",
      avatarColor: "bg-blue-500",
    },
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    replies: [
      {
        id: "reply-4",
        threadId: "thread-4",
        author: {
          name: "Sarah Mitchell",
          avatar: "SM",
          avatarColor: "bg-violet-500",
        },
        content:
          "I've identified the source. There's a timing difference due to a wire transfer initiated on Dec 31 but not received until Jan 2. Will prepare adjustment entry.",
        attachments: [],
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        isAccepted: false,
      },
    ],
    acceptedReplyId: null,
  },
  {
    id: "thread-5",
    title: "Tax calculation verification needed",
    description:
      "The VAT calculation on line 78 shows 18% rate but our standard rate for this jurisdiction is 20%. Please confirm if special exemption applies.",
    status: "resolved",
    author: {
      name: "Sarah Mitchell",
      avatar: "SM",
      avatarColor: "bg-violet-500",
    },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    replies: [
      {
        id: "reply-5",
        threadId: "thread-5",
        author: {
          name: "Michael Torres",
          avatar: "MT",
          avatarColor: "bg-amber-500",
        },
        content:
          "Confirmed. This transaction qualifies for the reduced rate under the digital services exemption (Regulation 2024/156). Documentation attached.",
        attachments: [{ id: "att-3", filename: "vat_exemption_certificate.pdf", size: "890 KB" }],
        createdAt: new Date(Date.now() - 46 * 60 * 60 * 1000),
        isAccepted: true,
      },
    ],
    acceptedReplyId: "reply-5",
  },
  {
    id: "thread-6",
    title: "Approval required for manual override",
    description:
      "Line 92 contains a manual override of the system-calculated depreciation amount. Per policy, this requires documented approval from the Controller.",
    status: "open",
    author: {
      name: "Lisa Wong",
      avatar: "LW",
      avatarColor: "bg-rose-500",
    },
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    replies: [],
    acceptedReplyId: null,
  },
]

export const useThreadsStore = create<ThreadsStore>((set) => ({
  threads: DEMO_THREADS,
  selectedThreadId: null,
  loading: {
    createThread: false,
    addReply: null,
    acceptReply: null,
    resolveThread: null,
    reopenThread: null,
  },

  setSelectedThreadId: (id) => set({ selectedThreadId: id }),

  createThread: async (title, description) => {
    set((state) => ({ loading: { ...state.loading, createThread: true } }))

    await simulateApiDelay(500)

    const newThread: Thread = {
      id: generateId(),
      title,
      description,
      status: "open",
      author: CURRENT_USER,
      createdAt: new Date(),
      replies: [],
      acceptedReplyId: null,
    }

    set((state) => ({
      threads: [newThread, ...state.threads],
      selectedThreadId: newThread.id,
      loading: { ...state.loading, createThread: false },
    }))
  },

  addReply: async (threadId, content, attachments = []) => {
    set((state) => ({ loading: { ...state.loading, addReply: threadId } }))

    await simulateApiDelay(400)

    const newReply: ThreadReply = {
      id: generateId(),
      threadId,
      author: CURRENT_USER,
      content,
      attachments,
      createdAt: new Date(),
      isAccepted: false,
    }

    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId ? { ...thread, replies: [...thread.replies, newReply] } : thread
      ),
      loading: { ...state.loading, addReply: null },
    }))
  },

  acceptReply: async (threadId, replyId) => {
    set((state) => ({ loading: { ...state.loading, acceptReply: replyId } }))

    await simulateApiDelay(300)

    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              acceptedReplyId: replyId,
              replies: thread.replies.map((reply) => ({
                ...reply,
                isAccepted: reply.id === replyId,
              })),
            }
          : thread
      ),
      loading: { ...state.loading, acceptReply: null },
    }))
  },

  unacceptReply: async (threadId, replyId) => {
    set((state) => ({ loading: { ...state.loading, acceptReply: replyId } }))

    await simulateApiDelay(300)

    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              acceptedReplyId: null,
              replies: thread.replies.map((reply) => ({
                ...reply,
                isAccepted: false,
              })),
            }
          : thread
      ),
      loading: { ...state.loading, acceptReply: null },
    }))
  },

  resolveThread: async (threadId) => {
    set((state) => ({ loading: { ...state.loading, resolveThread: threadId } }))

    await simulateApiDelay(400)

    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId ? { ...thread, status: "resolved" } : thread
      ),
      loading: { ...state.loading, resolveThread: null },
    }))
  },

  reopenThread: async (threadId) => {
    set((state) => ({ loading: { ...state.loading, reopenThread: threadId } }))

    await simulateApiDelay(400)

    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId ? { ...thread, status: "open" } : thread
      ),
      loading: { ...state.loading, reopenThread: null },
    }))
  },
}))
