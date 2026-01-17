import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

interface MarkdownDisplayProps {
  content: string
  className?: string
}

export function MarkdownDisplay({ content, className }: MarkdownDisplayProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="mb-2 font-semibold text-base">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-2 font-semibold text-sm">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-1 font-medium text-sm">{children}</h3>,
          p: ({ children }) => <p className="mb-2 text-sm leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="mb-2 list-disc pl-4 text-sm">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 list-decimal pl-4 text-sm">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          code: ({ children }) => (
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{children}</code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
