import Underline from "@tiptap/extension-underline"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/shared/lib/utils"

export interface RichTextContentProps {
  content: string
  className?: string
  /** Height in px above which content is collapsed with "View more". Defaults to 150. Set to 0 to disable. */
  collapsedHeight?: number
}

const PROSE_CLASSES = cn(
  "prose prose-sm max-w-none text-sm",
  "[&_p]:my-1 [&_p]:leading-normal",
  "[&_h2]:mt-2 [&_h2]:mb-1 [&_h2]:font-semibold [&_h2]:text-base",
  "[&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:font-semibold [&_h3]:text-sm",
  "[&_ol]:my-1 [&_ol]:pl-4 [&_ul]:my-1 [&_ul]:pl-4",
  "[&_li]:my-0.5",
  "[&_blockquote]:my-1 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
  "[&_pre]:my-1 [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0"
)

const DEFAULT_COLLAPSED_HEIGHT = 150

export function RichTextContent({
  content,
  className,
  collapsedHeight = DEFAULT_COLLAPSED_HEIGHT,
}: RichTextContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: cn(PROSE_CLASSES, "outline-none"),
      },
    },
  })

  const checkOverflow = useCallback(() => {
    if (containerRef.current && collapsedHeight > 0) {
      setIsOverflowing(containerRef.current.scrollHeight > collapsedHeight)
    }
  }, [collapsedHeight])

  // biome-ignore lint/correctness/useExhaustiveDependencies: need to re-check when editor renders content
  useEffect(() => {
    checkOverflow()
  }, [checkOverflow, content, editor])

  const shouldCollapse = collapsedHeight > 0 && isOverflowing && !isExpanded

  return (
    <div className={className}>
      <div
        className={cn("relative overflow-hidden", shouldCollapse && "mask-fade-bottom")}
        ref={containerRef}
        style={shouldCollapse ? { maxHeight: collapsedHeight } : undefined}
      >
        <EditorContent editor={editor} />
      </div>
      {collapsedHeight > 0 && isOverflowing && (
        <button
          className="mt-1 flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
          type="button"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              View less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              View more
            </>
          )}
        </button>
      )}
    </div>
  )
}
