import { CheckCircle2, FileSpreadsheet, FileText, Upload } from "lucide-react"
import { SectionContainer } from "@/components/journal/shared/section-container"
import { Button } from "@/components/ui/button"

interface Document {
  id: string
  name: string
  type: "excel" | "pdf" | "other"
  status: "uploaded" | "pending"
  uploadedAt?: string
}

const MOCK_DOCUMENTS: Document[] = [
  {
    id: "1",
    name: "January_GL_Extract.xlsx",
    type: "excel",
    status: "uploaded",
    uploadedAt: "Jan 15, 2025",
  },
  {
    id: "2",
    name: "Account_Reconciliation.xlsx",
    type: "excel",
    status: "uploaded",
    uploadedAt: "Jan 15, 2025",
  },
  {
    id: "3",
    name: "Supporting_Memo.pdf",
    type: "pdf",
    status: "uploaded",
    uploadedAt: "Jan 14, 2025",
  },
  {
    id: "4",
    name: "Approval_Email.pdf",
    type: "pdf",
    status: "uploaded",
    uploadedAt: "Jan 14, 2025",
  },
  {
    id: "5",
    name: "Variance_Analysis.xlsx",
    type: "excel",
    status: "uploaded",
    uploadedAt: "Jan 15, 2025",
  },
]

function getFileIcon(type: Document["type"]) {
  switch (type) {
    case "excel":
      return <FileSpreadsheet className="h-4 w-4 text-green-600" />
    case "pdf":
      return <FileText className="h-4 w-4 text-red-600" />
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />
  }
}

interface DataUploadSectionProps {
  readonly?: boolean
}

export function DataUploadSection({ readonly = false }: DataUploadSectionProps) {
  return (
    <SectionContainer title="Data Upload">
      <div className="space-y-3">
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Document</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DOCUMENTS.map((doc) => (
                <tr className="border-b last:border-0" key={doc.id}>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {getFileIcon(doc.type)}
                      <span className="truncate">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5 text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="text-xs">Uploaded</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{doc.uploadedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!readonly && (
          <Button className="gap-2" size="sm" variant="outline">
            <Upload className="h-3.5 w-3.5" />
            Upload Document
          </Button>
        )}
      </div>
    </SectionContainer>
  )
}
