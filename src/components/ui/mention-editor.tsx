import Mention from "@tiptap/extension-mention"
import Placeholder from "@tiptap/extension-placeholder"
import type { Editor, NodeViewProps } from "@tiptap/react"
import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import type { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion"
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Top-level regex patterns for mention parsing
const MENTION_BRACES_PATTERN = /@\{([^}]+)\}/g // @{Name} format
const MENTION_BRACKET_PATTERN = /@\[([^\]]+)\]\([^)]*\)/g // @[Name](id) format

// Mention badge component for rendering inside the editor
function MentionComponent({ node }: NodeViewProps) {
  return (
    <NodeViewWrapper as="span" className="inline">
      <Badge className="mx-0.5 cursor-default" variant="blue">
        @{node.attrs.label ?? node.attrs.id}
      </Badge>
    </NodeViewWrapper>
  )
}

// Extended Mention extension with React node view
const CustomMention = Mention.extend({
  addNodeView() {
    return ReactNodeViewRenderer(MentionComponent)
  },
})

// Suggestion list component
interface SuggestionListProps {
  items: string[]
  command: (attrs: { id: string; label: string }) => void
  selectedIndex: number
  onSelectIndex: (index: number) => void
}

interface SuggestionListRef {
  onKeyDown: (event: KeyboardEvent) => boolean
}

const SuggestionList = forwardRef<SuggestionListRef, SuggestionListProps>(
  ({ items, command, selectedIndex, onSelectIndex }, ref) => {
    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === "ArrowUp") {
          onSelectIndex((selectedIndex + items.length - 1) % items.length)
          return true
        }
        if (event.key === "ArrowDown") {
          onSelectIndex((selectedIndex + 1) % items.length)
          return true
        }
        if (event.key === "Enter") {
          if (items.length > 0) {
            command({ id: items[selectedIndex], label: items[selectedIndex] })
          }
          return true
        }
        return false
      },
    }))

    if (items.length === 0) {
      return null
    }

    return (
      <div className="z-50 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
        {items.map((item, index) => (
          <button
            className={cn(
              "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
              index === selectedIndex && "bg-muted"
            )}
            key={item}
            onClick={() => command({ id: item, label: item })}
            onMouseEnter={() => onSelectIndex(index)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
    )
  }
)

SuggestionList.displayName = "SuggestionList"

// Suggestion dropdown portal component
interface SuggestionPortalProps {
  items: string[]
  command: (attrs: { id: string; label: string }) => void
  clientRect: (() => DOMRect | null) | null | undefined
  onKeyDown: React.MutableRefObject<((event: KeyboardEvent) => boolean) | null>
}

function SuggestionPortal({ items, command, clientRect, onKeyDown }: SuggestionPortalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const listRef = useRef<SuggestionListRef>(null)

  // Reset selected index when items change
  const itemsKey = items.join(",")
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset on items change
  useEffect(() => {
    setSelectedIndex(0)
  }, [itemsKey])

  useEffect(() => {
    onKeyDown.current = (event: KeyboardEvent) => {
      return listRef.current?.onKeyDown(event) ?? false
    }
  }, [onKeyDown])

  if (!clientRect || items.length === 0) {
    return null
  }

  const rect = clientRect()
  if (!rect) {
    return null
  }

  return createPortal(
    <div
      style={{
        position: "absolute",
        left: rect.left,
        top: rect.bottom + 4,
        zIndex: 50,
      }}
    >
      <SuggestionList
        command={command}
        items={items}
        onSelectIndex={setSelectedIndex}
        ref={listRef}
        selectedIndex={selectedIndex}
      />
    </div>,
    document.body
  )
}

// Suggestion state for managing the dropdown
interface SuggestionState {
  items: string[]
  command: ((attrs: { id: string; label: string }) => void) | null
  clientRect: (() => DOMRect | null) | null | undefined
}

// Create suggestion configuration
function createSuggestion(
  mentions: string[],
  setSuggestionState: React.Dispatch<React.SetStateAction<SuggestionState>>,
  keyDownRef: React.MutableRefObject<((event: KeyboardEvent) => boolean) | null>
) {
  return {
    items: ({ query }: { query: string }) => {
      return mentions
        .filter((item) => item.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, 5)
    },
    render: () => {
      return {
        onStart: (props: SuggestionProps<string>) => {
          setSuggestionState({
            items: props.items,
            command: props.command,
            clientRect: props.clientRect,
          })
        },
        onUpdate: (props: SuggestionProps<string>) => {
          setSuggestionState({
            items: props.items,
            command: props.command,
            clientRect: props.clientRect,
          })
        },
        onKeyDown: (props: SuggestionKeyDownProps) => {
          if (props.event.key === "Escape") {
            setSuggestionState({ items: [], command: null, clientRect: null })
            return true
          }
          return keyDownRef.current?.(props.event) ?? false
        },
        onExit: () => {
          setSuggestionState({ items: [], command: null, clientRect: null })
        },
      }
    },
  }
}

// Convert text with mentions to Tiptap JSON content
// Handles multiple formats: @{Name}, @[Name](id), @Name
function stringToTiptapContent(text: string, availableMentions: string[]) {
  if (!text) {
    return {
      type: "doc",
      content: [{ type: "paragraph" }],
    }
  }

  // Build regex pattern that matches all mention formats
  // Sort by length descending to match longer names first
  const sortedMentions = [...availableMentions].sort((a, b) => b.length - a.length)
  const escapedMentions = sortedMentions.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  const mentionNamesPattern = escapedMentions.length > 0 ? escapedMentions.join("|") : ""

  // Combined pattern: @{Name} or @[Name](id) or @KnownName
  // The order matters - more specific patterns first
  const patternParts = [
    MENTION_BRACES_PATTERN.source, // @{Name} format
    MENTION_BRACKET_PATTERN.source, // @[Name](id) format
  ]
  if (mentionNamesPattern) {
    patternParts.push(`@(${mentionNamesPattern})`) // @KnownName format
  }

  const combinedPattern = new RegExp(patternParts.join("|"), "g")

  // Handle multi-line by splitting on newlines and creating paragraphs
  // Filter out trailing empty lines to prevent extra cursor rows
  const lines = text.split("\n")

  // Remove trailing empty lines but keep internal ones
  let lastNonEmptyIndex = lines.length - 1
  while (lastNonEmptyIndex >= 0 && lines[lastNonEmptyIndex].trim() === "") {
    lastNonEmptyIndex--
  }
  const trimmedLines = lastNonEmptyIndex >= 0 ? lines.slice(0, lastNonEmptyIndex + 1) : [""]

  const paragraphs = trimmedLines.map((line) => {
    const lineParts: Array<{ type: "text" | "mention"; content: string }> = []
    let lineLastIndex = 0
    let lineMatch: RegExpExecArray | null = null

    // Reset regex for each line
    combinedPattern.lastIndex = 0

    while (true) {
      lineMatch = combinedPattern.exec(line)
      if (lineMatch === null) {
        break
      }

      if (lineMatch.index > lineLastIndex) {
        lineParts.push({ type: "text", content: line.slice(lineLastIndex, lineMatch.index) })
      }

      // Extract mention name from whichever capture group matched
      const mentionName = lineMatch[1] ?? lineMatch[2] ?? lineMatch[3]
      if (mentionName) {
        lineParts.push({ type: "mention", content: mentionName })
      }
      lineLastIndex = lineMatch.index + lineMatch[0].length
    }

    if (lineLastIndex < line.length) {
      lineParts.push({ type: "text", content: line.slice(lineLastIndex) })
    }

    if (lineParts.length === 0) {
      return { type: "paragraph" }
    }

    return {
      type: "paragraph",
      content: lineParts.map((part) => {
        if (part.type === "mention") {
          return {
            type: "mention",
            attrs: { id: part.content, label: part.content },
          }
        }
        return { type: "text", text: part.content }
      }),
    }
  })

  return {
    type: "doc",
    content: paragraphs.length > 0 ? paragraphs : [{ type: "paragraph" }],
  }
}

// Convert Tiptap editor content to @{Name} string format
function tiptapToString(editor: Editor): string {
  const json = editor.getJSON()
  if (!json.content) {
    return ""
  }

  const lines = json.content.map((node) => {
    if (node.type !== "paragraph" || !node.content) {
      return ""
    }

    return node.content
      .map((child) => {
        const childNode = child as {
          type?: string
          attrs?: { label?: string; id?: string }
          text?: string
        }
        if (childNode.type === "mention") {
          return `@{${childNode.attrs?.label ?? childNode.attrs?.id ?? ""}}`
        }
        if (childNode.type === "text") {
          return childNode.text ?? ""
        }
        return ""
      })
      .join("")
  })

  return lines.join("\n")
}

export interface MentionEditorProps {
  value: string
  onChange?: (value: string) => void
  mentions: string[]
  placeholder?: string
  readonly?: boolean
  disabled?: boolean
}

export function MentionEditor({
  value,
  onChange,
  mentions,
  placeholder,
  readonly = false,
  disabled = false,
}: MentionEditorProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [suggestionState, setSuggestionState] = useState<SuggestionState>({
    items: [],
    command: null,
    clientRect: null,
  })
  const valueRef = useRef(value)
  const keyDownRef = useRef<((event: KeyboardEvent) => boolean) | null>(null)

  // Keep ref in sync
  useEffect(() => {
    valueRef.current = value
  }, [value])

  const suggestion = useMemo(
    () => createSuggestion(mentions, setSuggestionState, keyDownRef),
    [mentions]
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        bold: false,
        italic: false,
        strike: false,
      }),
      CustomMention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "",
      }),
    ],
    content: stringToTiptapContent(value, mentions),
    editable: !(readonly || disabled),
    onUpdate: ({ editor }) => {
      const newValue = tiptapToString(editor)
      if (newValue !== valueRef.current) {
        valueRef.current = newValue
        onChange?.(newValue)
      }
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[80px] w-full px-3 py-2 text-base outline-none md:text-sm",
          "[&_p]:m-0 [&_p]:leading-normal",
          "[&_p:empty]:hidden" // Hide empty paragraphs
        ),
      },
    },
  })

  // Sync content when value changes externally
  useEffect(() => {
    if (editor && !editor.isFocused) {
      const currentContent = tiptapToString(editor)
      if (currentContent !== value) {
        editor.commands.setContent(stringToTiptapContent(value, mentions))
      }
    }
  }, [value, editor, mentions])

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!(readonly || disabled))
    }
  }, [editor, readonly, disabled])

  if (readonly) {
    return (
      <div
        className={cn(
          "text-sm leading-relaxed",
          "[&_.ProseMirror]:min-h-0 [&_.ProseMirror]:p-0 [&_.ProseMirror]:outline-none",
          "[&_.ProseMirror_p]:m-0",
          "[&_.ProseMirror_p:empty]:hidden"
        )}
      >
        <EditorContent editor={editor} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-background transition-shadow",
        isFocused && "ring-2 ring-ring ring-offset-2",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <EditorContent editor={editor} />
      {suggestionState.command && (
        <SuggestionPortal
          clientRect={suggestionState.clientRect}
          command={suggestionState.command}
          items={suggestionState.items}
          onKeyDown={keyDownRef}
        />
      )}
    </div>
  )
}
