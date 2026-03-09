import { create } from "zustand"
import type {
  Thread,
  ThreadAttachment,
  ThreadAuthor,
  ThreadReply,
  ThreadStatus,
} from "@/features/journal/state/threads-store"
import { CURRENT_USER } from "@/features/journal/state/threads-store"

interface LoadingState {
  createThread: boolean
  addReply: string | null
  resolveThread: string | null
  reopenThread: string | null
  changeAssignee: string | null
}

interface RichThreadsStore {
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
  return `rth-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const simulateApiDelay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))

const DEFAULT_ASSIGNEE: ThreadAuthor = {
  name: "Sarah Mitchell",
  avatar: "SM",
  avatarColor: "bg-violet-500",
}

const STATUS_ORDER: ThreadStatus[] = ["pending", "review", "resolved"]

// Demo seed data with rich text HTML content
const DEMO_THREADS: Thread[] = [
  {
    id: "rthread-1",
    title: "Variance in Account 4500-01 exceeds threshold",
    description: `<h2>Variance Analysis — Account 4500-01</h2>
<p>The variance analysis shows Account 4500-01 has a <strong>7.2% deviation</strong> from the expected amount. This exceeds our standard <strong>5% threshold</strong>.</p>
<h3>Key observations</h3>
<ul>
<li>Expected balance: <code>$142,500</code></li>
<li>Actual balance: <code>$152,766</code></li>
<li>Variance: <code>$10,266</code> (7.2%)</li>
</ul>
<blockquote><p>Per our policy, any variance above 5% requires supporting documentation and manager approval before the journal can proceed.</p></blockquote>
<p>Can someone please provide supporting documentation or explanation for this variance?</p>`,
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
      { id: "ratt-t1-1", filename: "variance_threshold_report.pdf", size: "890 KB" },
      { id: "ratt-t1-2", filename: "account_4500_details.xlsx", size: "1.3 MB" },
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    replies: [
      {
        id: "rreply-1",
        threadId: "rthread-1",
        author: {
          name: "Sarah Mitchell",
          avatar: "SM",
          avatarColor: "bg-violet-500",
        },
        content: `<p>I've checked the source data. The variance is due to a <strong>timing difference</strong> in the accrual recognition:</p>
<ul>
<li>Invoice <code>#INV-2024-1247</code> was dated <u>Dec 31</u> but posted on <u>Jan 2</u></li>
<li>This created a temporary mismatch of <strong>$10,266</strong></li>
</ul>
<p>The attached analysis confirms this is a <em>cutoff timing issue</em>, not a substantive error. The amount will self-correct in the January period.</p>`,
        attachments: [{ id: "ratt-1", filename: "invoice_timing_analysis.xlsx", size: "245 KB" }],
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      },
      {
        id: "rreply-2",
        threadId: "rthread-1",
        author: {
          name: "David Chen",
          avatar: "DC",
          avatarColor: "bg-blue-500",
        },
        content: `<p>Thanks Sarah. I've reviewed the timing analysis and it <strong>aligns with our cutoff procedures</strong>.</p>
<blockquote><p>Recommendation: Accept the variance with a note referencing the timing difference. No adjusting entry required.</p></blockquote>
<p>@Michael, would this explanation suffice for the review?</p>`,
        attachments: [],
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
      },
    ],
  },
  {
    id: "rthread-2",
    title: "Missing supporting document for reclassification entry",
    description: `<p>Line 23 contains a reclassification entry but I <strong>cannot find</strong> the supporting memo in the attachments.</p>
<h3>Required documentation</h3>
<ol>
<li>Reclassification memo signed by the Controller</li>
<li>Original posting reference</li>
<li>GL account mapping justification</li>
</ol>
<p>Please upload the required documentation <u>before end of day</u>.</p>`,
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
    attachments: [{ id: "ratt-t2-1", filename: "reclassification_entries.xlsx", size: "456 KB" }],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    replies: [
      {
        id: "rreply-3",
        threadId: "rthread-2",
        author: {
          name: "Sarah Mitchell",
          avatar: "SM",
          avatarColor: "bg-violet-500",
        },
        content: `<p>Apologies for the oversight. I've now uploaded the reclassification memo approved by the Controller on Dec 28.</p>
<p>All three items are covered:</p>
<ul>
<li><s>Reclassification memo signed by the Controller</s> ✓</li>
<li><s>Original posting reference</s> ✓</li>
<li><s>GL account mapping justification</s> ✓</li>
</ul>`,
        attachments: [{ id: "ratt-2", filename: "reclass_memo_dec28.pdf", size: "1.2 MB" }],
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: "rthread-3",
    title: "Duplicate entry detected in cost center 7200",
    description: `<p>Lines 45 and 47 appear to be <strong>duplicate postings</strong> for the same vendor invoice.</p>
<h3>Details</h3>
<ul>
<li>Vendor: <em>Acme Consulting LLC</em></li>
<li>Invoice: <code>#INV-2024-8834</code></li>
<li>Amount: <strong>$28,750.00</strong> (each line)</li>
</ul>
<pre><code>Line 45: DR Consulting Expense  $28,750.00  (CC 7200)
Line 47: DR Consulting Expense  $28,750.00  (CC 7200)</code></pre>
<p>Please verify and confirm if one should be <u>reversed</u>.</p>`,
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
      { id: "ratt-t3-1", filename: "cost_center_7200_ledger.pdf", size: "2.4 MB" },
      { id: "ratt-t3-2", filename: "invoice_INV-2024-8834.pdf", size: "178 KB" },
    ],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    replies: [],
  },
  {
    id: "rthread-4",
    title: "Intercompany balance does not reconcile",
    description: `<p>The intercompany receivable on Entity A does <strong>not match</strong> the corresponding payable on Entity B.</p>
<h3>Reconciliation summary</h3>
<ul>
<li>Entity A — Account <code>1200-IC</code>: <strong>$345,200</strong></li>
<li>Entity B — Account <code>2100-IC</code>: <strong>$332,750</strong></li>
<li>Discrepancy: <strong>$12,450</strong></li>
</ul>
<blockquote><p>Intercompany balances must reconcile to zero per our consolidation policy. Any unresolved differences above $5,000 require investigation.</p></blockquote>
<p>Please investigate the <code>$12,450</code> difference and provide a resolution plan.</p>`,
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
    attachments: [{ id: "ratt-t4-1", filename: "intercompany_recon.xlsx", size: "1.8 MB" }],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    replies: [
      {
        id: "rreply-4",
        threadId: "rthread-4",
        author: {
          name: "Michael Torres",
          avatar: "MT",
          avatarColor: "bg-amber-500",
        },
        content: `<p>I've traced the discrepancy to a <strong>late posting</strong> on Entity B's side.</p>
<ul>
<li>Invoice <code>#IC-2024-0892</code> was processed on Jan 3</li>
<li>Should have been accrued in December</li>
<li>Amount: <strong>$12,450</strong> — matches the difference exactly</li>
</ul>
<p>Working on the correcting entry now. Will update once posted.</p>`,
        attachments: [{ id: "ratt-4", filename: "entity_b_late_posting.pdf", size: "340 KB" }],
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: "rthread-5",
    title: "FX translation rate used appears incorrect",
    description: `<h2>FX Rate Discrepancy</h2>
<p>The EUR/USD rate used for the December translation appears <strong>incorrect</strong>:</p>
<ul>
<li>Rate used: <code>1.0842</code></li>
<li>ECB closing rate (Dec 31): <code>1.1050</code></li>
<li>Impact: approximately <strong>$23,000</strong> on the translated balance</li>
</ul>
<blockquote><p>Our policy requires using the ECB closing rate as published on the last business day of the period.</p></blockquote>
<p>Please confirm the source of the rate used and correct if necessary.</p>`,
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
      { id: "ratt-t5-1", filename: "fx_rate_comparison.xlsx", size: "290 KB" },
      { id: "ratt-t5-2", filename: "ecb_rates_dec.pdf", size: "145 KB" },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    replies: [
      {
        id: "rreply-5",
        threadId: "rthread-5",
        author: {
          name: "James Rodriguez",
          avatar: "JR",
          avatarColor: "bg-orange-500",
        },
        content: `<p>Good catch. The rate used was from our <em>treasury system</em> which updates at <strong>noon</strong>, not at closing.</p>
<p>I've corrected the translation using the ECB closing rate. Here's the impact:</p>
<pre><code>Before: EUR 1,000,000 × 1.0842 = $1,084,200
After:  EUR 1,000,000 × 1.1050 = $1,105,000
Adjustment needed: $20,800</code></pre>`,
        attachments: [{ id: "ratt-5", filename: "corrected_translation.xlsx", size: "410 KB" }],
        createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
      },
      {
        id: "rreply-6",
        threadId: "rthread-5",
        author: {
          name: "Lisa Wong",
          avatar: "LW",
          avatarColor: "bg-rose-500",
        },
        content: `<p>Confirmed — the corrected balance now <strong>ties to the GL</strong>. Marking this as resolved.</p>
<p><em>Note: we should flag the treasury system rate source as a recurring risk item for future periods.</em></p>`,
        attachments: [],
        createdAt: new Date(Date.now() - 1.2 * 24 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: "rthread-6",
    title: "Revenue recognition criteria not documented",
    description: `<p>The <strong>$150K revenue entry</strong> on line 67 does not have the required five-step analysis documentation per <em>ASC 606</em>.</p>
<h3>Missing items</h3>
<ol>
<li>Contract identification</li>
<li>Performance obligation identification</li>
<li>Transaction price determination</li>
<li>Allocation to performance obligations</li>
<li>Revenue recognition timing</li>
</ol>
<p>Please attach the completed revenue recognition checklist.</p>`,
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
    attachments: [{ id: "ratt-t6-1", filename: "revenue_entry_details.pdf", size: "190 KB" }],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    replies: [
      {
        id: "rreply-7",
        threadId: "rthread-6",
        author: {
          name: "Sarah Mitchell",
          avatar: "SM",
          avatarColor: "bg-violet-500",
        },
        content: `<p>The ASC 606 checklist was completed but <u>filed under the wrong project folder</u>. I've attached it here and updated the filing.</p>
<p>All five steps have been documented and approved:</p>
<ul>
<li><s>Contract identification</s> — Contract <code>#C-2024-0445</code></li>
<li><s>Performance obligation identification</s> — Single deliverable</li>
<li><s>Transaction price determination</s> — Fixed price $150,000</li>
<li><s>Allocation to performance obligations</s> — 100% to single obligation</li>
<li><s>Revenue recognition timing</s> — Point in time, upon delivery</li>
</ul>`,
        attachments: [
          { id: "ratt-6", filename: "asc606_checklist_complete.pdf", size: "560 KB" },
          { id: "ratt-7", filename: "contract_summary.pdf", size: "230 KB" },
        ],
        createdAt: new Date(Date.now() - 2.8 * 24 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: "rthread-7",
    title: "Lease liability amortization schedule mismatch",
    description: `<p>The lease liability balance for <strong>Office Lease #OL-2023-05</strong> doesn't match the amortization schedule:</p>
<ul>
<li>GL balance: <code>$284,500</code></li>
<li>Amortization schedule: <code>$279,800</code></li>
<li>Difference: <strong>$4,700</strong></li>
</ul>
<p>Please reconcile and explain the <code>$4,700</code> difference.</p>`,
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
    attachments: [{ id: "ratt-t7-1", filename: "lease_amort_schedule.xlsx", size: "780 KB" }],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    replies: [
      {
        id: "rreply-8",
        threadId: "rthread-7",
        author: {
          name: "Anna Kim",
          avatar: "AK",
          avatarColor: "bg-pink-500",
        },
        content: `<p>Looking into this now. I suspect the <strong>$4,700 difference</strong> is from the lease modification we processed mid-month.</p>
<blockquote><p>The modification effective date was Dec 15, but the amortization schedule wasn't regenerated until Dec 20. The 5-day gap would account for the incremental interest accrual.</p></blockquote>
<p>I'll update the schedule and post the correcting entry by EOD.</p>`,
        attachments: [],
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: "rthread-8",
    title: "Unsubstantiated accrual for consulting fees",
    description: `<p>Account <code>6100-03</code> has a <strong>$45,000 accrual</strong> for consulting fees but no contract or PO reference is attached.</p>
<h3>What we need</h3>
<ul>
<li>Engagement letter or statement of work</li>
<li>Purchase order reference</li>
<li>Approval from budget owner</li>
</ul>
<p><em>Without supporting documentation, this accrual cannot be validated during the review cycle.</em></p>`,
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
    attachments: [{ id: "ratt-t8-1", filename: "accrual_schedule_dec.xlsx", size: "520 KB" }],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    replies: [],
  },
]

export const useRichThreadsStore = create<RichThreadsStore>((set) => ({
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
