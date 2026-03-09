import { create } from "zustand"

export type ThreadStatus = "pending" | "review" | "resolved"

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
}

export interface Thread {
  id: string
  title: string
  description: string
  status: ThreadStatus
  author: ThreadAuthor
  assignee: ThreadAuthor
  attachments: ThreadAttachment[]
  createdAt: Date
  replies: ThreadReply[]
}

interface LoadingState {
  createThread: boolean
  addReply: string | null
  resolveThread: string | null
  reopenThread: string | null
  changeAssignee: string | null
}

interface ThreadsStore {
  threads: Thread[]
  selectedThreadId: string | null
  loading: LoadingState
  setSelectedThreadId: (id: string | null) => void
  createThread: (
    title: string,
    description: string,
    attachments?: ThreadAttachment[],
    assignee?: ThreadAuthor
  ) => Promise<void>
  addReply: (threadId: string, content: string, attachments?: ThreadAttachment[]) => Promise<void>
  advanceStatus: (threadId: string) => Promise<void>
  revertToPending: (threadId: string) => Promise<void>
  changeAssignee: (threadId: string, assignee: ThreadAuthor) => Promise<void>
}

function generateId(): string {
  return `th-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// Simulate API delay for demo realism
const simulateApiDelay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))

// Current user for demo
export const CURRENT_USER: ThreadAuthor = {
  name: "John Davis",
  avatar: "JD",
  avatarColor: "bg-sky-500",
}

// Default assignee (journal preparer) for new threads
const DEFAULT_ASSIGNEE: ThreadAuthor = {
  name: "Sarah Mitchell",
  avatar: "SM",
  avatarColor: "bg-violet-500",
}

// Available users for assignee selection in demo
export const DEMO_USERS: ThreadAuthor[] = [
  { name: "Sarah Mitchell", avatar: "SM", avatarColor: "bg-violet-500" },
  { name: "Michael Torres", avatar: "MT", avatarColor: "bg-amber-500" },
  { name: "David Chen", avatar: "DC", avatarColor: "bg-blue-500" },
  { name: "Lisa Wong", avatar: "LW", avatarColor: "bg-rose-500" },
  { name: "John Davis", avatar: "JD", avatarColor: "bg-sky-500" },
  { name: "Emily Parker", avatar: "EP", avatarColor: "bg-emerald-500" },
  { name: "James Rodriguez", avatar: "JR", avatarColor: "bg-orange-500" },
  { name: "Anna Kim", avatar: "AK", avatarColor: "bg-pink-500" },
]

// Demo seed data
const DEMO_THREADS: Thread[] = [
  {
    id: "thread-1",
    title: "Variance in Account 4500-01 exceeds threshold",
    description:
      "The variance analysis shows Account 4500-01 has a 7.2% deviation from the expected amount. This exceeds our standard 5% threshold. Can someone please provide supporting documentation or explanation for this variance?",
    status: "review",
    author: {
      name: "Michael Torres",
      avatar: "MT",
      avatarColor: "bg-amber-500",
    },
    assignee: {
      name: "Sarah Mitchell",
      avatar: "SM",
      avatarColor: "bg-violet-500",
    },
    attachments: [
      { id: "att-t1-1", filename: "variance_threshold_report.pdf", size: "890 KB" },
      { id: "att-t1-2", filename: "account_4500_details.xlsx", size: "1.3 MB" },
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
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
      },
    ],
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
    assignee: {
      name: "Sarah Mitchell",
      avatar: "SM",
      avatarColor: "bg-violet-500",
    },
    attachments: [{ id: "att-t2-1", filename: "reclassification_entries.xlsx", size: "456 KB" }],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
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
      },
    ],
  },
  {
    id: "thread-3",
    title: "Duplicate entry detected in cost center 7200",
    description:
      "Lines 45 and 47 appear to be duplicate postings for the same vendor invoice #INV-2024-8834. Please verify and confirm if one should be reversed.",
    status: "pending",
    author: {
      name: "Lisa Wong",
      avatar: "LW",
      avatarColor: "bg-rose-500",
    },
    assignee: {
      name: "David Chen",
      avatar: "DC",
      avatarColor: "bg-blue-500",
    },
    attachments: [
      { id: "att-t3-1", filename: "cost_center_7200_ledger.pdf", size: "2.4 MB" },
      { id: "att-t3-2", filename: "invoice_INV-2024-8834.pdf", size: "178 KB" },
      { id: "att-t3-3", filename: "duplicate_analysis.xlsx", size: "320 KB" },
    ],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    replies: [],
  },
  {
    id: "thread-4",
    title: "Intercompany balance does not reconcile",
    description:
      "The intercompany receivable on Entity A (Account 1200-IC) does not match the corresponding payable on Entity B. There is a $12,450 discrepancy that needs investigation.",
    status: "review",
    author: {
      name: "Emily Parker",
      avatar: "EP",
      avatarColor: "bg-emerald-500",
    },
    assignee: {
      name: "Michael Torres",
      avatar: "MT",
      avatarColor: "bg-amber-500",
    },
    attachments: [{ id: "att-t4-1", filename: "intercompany_recon.xlsx", size: "1.8 MB" }],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    replies: [
      {
        id: "reply-4",
        threadId: "thread-4",
        author: {
          name: "Michael Torres",
          avatar: "MT",
          avatarColor: "bg-amber-500",
        },
        content:
          "I've traced the discrepancy to a late posting on Entity B's side. The invoice was processed on Jan 3 but should have been accrued in December. Working on the correcting entry now.",
        attachments: [{ id: "att-4", filename: "entity_b_late_posting.pdf", size: "340 KB" }],
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: "thread-5",
    title: "Unsubstantiated accrual for consulting fees",
    description:
      "Account 6100-03 has a $45,000 accrual for consulting fees but no contract or PO reference is attached. Please provide the engagement letter or purchase order.",
    status: "pending",
    author: {
      name: "Michael Torres",
      avatar: "MT",
      avatarColor: "bg-amber-500",
    },
    assignee: {
      name: "Emily Parker",
      avatar: "EP",
      avatarColor: "bg-emerald-500",
    },
    attachments: [{ id: "att-t5-1", filename: "accrual_schedule_dec.xlsx", size: "520 KB" }],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    replies: [],
  },
  {
    id: "thread-6",
    title: "FX translation rate used appears incorrect",
    description:
      "The EUR/USD rate used for the December translation is 1.0842, but the ECB closing rate was 1.1050. This impacts the translated balance by approximately $23K. Please confirm source of rate used.",
    status: "resolved",
    author: {
      name: "Lisa Wong",
      avatar: "LW",
      avatarColor: "bg-rose-500",
    },
    assignee: {
      name: "James Rodriguez",
      avatar: "JR",
      avatarColor: "bg-orange-500",
    },
    attachments: [
      { id: "att-t6-1", filename: "fx_rate_comparison.xlsx", size: "290 KB" },
      { id: "att-t6-2", filename: "ecb_rates_dec.pdf", size: "145 KB" },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    replies: [
      {
        id: "reply-5",
        threadId: "thread-6",
        author: {
          name: "James Rodriguez",
          avatar: "JR",
          avatarColor: "bg-orange-500",
        },
        content:
          "Good catch. The rate used was from our treasury system which updates at noon, not closing. I've corrected the translation using the ECB closing rate.",
        attachments: [{ id: "att-5", filename: "corrected_translation.xlsx", size: "410 KB" }],
        createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
      },
      {
        id: "reply-6",
        threadId: "thread-6",
        author: {
          name: "Lisa Wong",
          avatar: "LW",
          avatarColor: "bg-rose-500",
        },
        content: "Confirmed the corrected balance now ties to the GL. Marking this as resolved.",
        attachments: [],
        createdAt: new Date(Date.now() - 1.2 * 24 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: "thread-7",
    title: "Lease liability amortization schedule mismatch",
    description:
      "The lease liability balance for Office Lease #OL-2023-05 doesn't match the amortization schedule. The GL shows $284,500 but the schedule indicates $279,800.",
    status: "pending",
    author: {
      name: "Emily Parker",
      avatar: "EP",
      avatarColor: "bg-emerald-500",
    },
    assignee: {
      name: "Anna Kim",
      avatar: "AK",
      avatarColor: "bg-pink-500",
    },
    attachments: [{ id: "att-t7-1", filename: "lease_amort_schedule.xlsx", size: "780 KB" }],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    replies: [
      {
        id: "reply-7",
        threadId: "thread-7",
        author: {
          name: "Anna Kim",
          avatar: "AK",
          avatarColor: "bg-pink-500",
        },
        content:
          "Looking into this now. I suspect the $4,700 difference is from the lease modification we processed mid-month that wasn't reflected in the schedule yet.",
        attachments: [],
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: "thread-8",
    title: "Revenue recognition criteria not documented",
    description:
      "The $150K revenue entry on line 67 does not have the required five-step analysis documentation per ASC 606. Please attach the completed revenue recognition checklist.",
    status: "resolved",
    author: {
      name: "David Chen",
      avatar: "DC",
      avatarColor: "bg-blue-500",
    },
    assignee: {
      name: "Sarah Mitchell",
      avatar: "SM",
      avatarColor: "bg-violet-500",
    },
    attachments: [{ id: "att-t8-1", filename: "revenue_entry_details.pdf", size: "190 KB" }],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    replies: [
      {
        id: "reply-8",
        threadId: "thread-8",
        author: {
          name: "Sarah Mitchell",
          avatar: "SM",
          avatarColor: "bg-violet-500",
        },
        content:
          "The ASC 606 checklist was completed but filed under the wrong project folder. I've attached it here and updated the filing.",
        attachments: [
          { id: "att-6", filename: "asc606_checklist_complete.pdf", size: "560 KB" },
          { id: "att-7", filename: "contract_summary.pdf", size: "230 KB" },
        ],
        createdAt: new Date(Date.now() - 2.8 * 24 * 60 * 60 * 1000),
      },
    ],
  },
]

const STATUS_ORDER: ThreadStatus[] = ["pending", "review", "resolved"]

export const useThreadsStore = create<ThreadsStore>((set) => ({
  threads: DEMO_THREADS,
  selectedThreadId: null,
  loading: {
    createThread: false,
    addReply: null,
    resolveThread: null,
    reopenThread: null,
    changeAssignee: null,
  },

  setSelectedThreadId: (id) => set({ selectedThreadId: id }),

  createThread: async (title, description, attachments, assignee) => {
    set((state) => ({ loading: { ...state.loading, createThread: true } }))

    await simulateApiDelay(500)

    const newThread: Thread = {
      id: generateId(),
      title,
      description,
      status: "pending",
      author: CURRENT_USER,
      assignee: assignee ?? DEFAULT_ASSIGNEE,
      attachments: attachments ?? [],
      createdAt: new Date(),
      replies: [],
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
    }

    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId ? { ...thread, replies: [...thread.replies, newReply] } : thread
      ),
      loading: { ...state.loading, addReply: null },
    }))
  },

  advanceStatus: async (threadId) => {
    set((state) => ({ loading: { ...state.loading, resolveThread: threadId } }))

    await simulateApiDelay(400)

    set((state) => ({
      threads: state.threads.map((thread) => {
        if (thread.id !== threadId) {
          return thread
        }
        const currentIndex = STATUS_ORDER.indexOf(thread.status)
        const nextIndex = Math.min(currentIndex + 1, STATUS_ORDER.length - 1)
        return { ...thread, status: STATUS_ORDER[nextIndex] }
      }),
      loading: { ...state.loading, resolveThread: null },
    }))
  },

  revertToPending: async (threadId) => {
    set((state) => ({ loading: { ...state.loading, reopenThread: threadId } }))

    await simulateApiDelay(400)

    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId ? { ...thread, status: "pending" } : thread
      ),
      loading: { ...state.loading, reopenThread: null },
    }))
  },

  changeAssignee: async (threadId, assignee) => {
    set((state) => ({ loading: { ...state.loading, changeAssignee: threadId } }))

    await simulateApiDelay(400)

    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId ? { ...thread, assignee } : thread
      ),
      loading: { ...state.loading, changeAssignee: null },
    }))
  },
}))
