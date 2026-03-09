import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"
import type { Editor } from "@tiptap/react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  SquareCode,
  Strikethrough,
  Underline as UnderlineIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/shared/lib/utils"

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title: string
}

function ToolbarButton({ onClick, isActive, disabled, children, title }: ToolbarButtonProps) {
  return (
    <button
      className={cn(
        "rounded p-1.5 transition-colors hover:bg-muted",
        isActive && "bg-muted text-foreground",
        disabled && "pointer-events-none opacity-50"
      )}
      disabled={disabled}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-border" />
}

function Toolbar({ editor }: { editor: Editor }) {
  const iconSize = "h-3.5 w-3.5"

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
      <ToolbarButton
        isActive={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <Heading2 className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        isActive={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      >
        <Heading3 className={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        isActive={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <Bold className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        isActive={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <Italic className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        isActive={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
      >
        <UnderlineIcon className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        isActive={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <Strikethrough className={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        isActive={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet list"
      >
        <List className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        isActive={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Ordered list"
      >
        <ListOrdered className={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        isActive={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Blockquote"
      >
        <Quote className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        isActive={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline code"
      >
        <Code className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        isActive={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code block"
      >
        <SquareCode className={iconSize} />
      </ToolbarButton>
    </div>
  )
}

export interface RichTextEditorProps {
  content?: string
  onChange?: (html: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function RichTextEditor({
  content = "",
  onChange,
  placeholder,
  disabled = false,
  className,
}: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false)
  const contentRef = useRef(content)

  useEffect(() => {
    contentRef.current = content
  }, [content])

  const editor = useEditor({
    extensions: [StarterKit, Underline, Placeholder.configure({ placeholder: placeholder ?? "" })],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      if (html !== contentRef.current) {
        contentRef.current = html
        onChange?.(html)
      }
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none px-3 py-2 outline-none",
          "min-h-[100px]",
          "[&_p]:my-1 [&_p]:leading-normal",
          "[&_h2]:mt-2 [&_h2]:mb-1 [&_h2]:font-semibold [&_h2]:text-base",
          "[&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:font-semibold [&_h3]:text-sm",
          "[&_ol]:my-1 [&_ol]:pl-4 [&_ul]:my-1 [&_ul]:pl-4",
          "[&_li]:my-0.5",
          "[&_blockquote]:my-1 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
          "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
          "[&_pre]:my-1 [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3",
          "[&_pre_code]:bg-transparent [&_pre_code]:p-0"
        ),
      },
    },
  })

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [editor, disabled])

  // Sync content externally (e.g. after form reset)
  useEffect(() => {
    if (editor && !editor.isFocused && content !== contentRef.current) {
      editor.commands.setContent(content)
      contentRef.current = content
    }
  }, [content, editor])

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-input bg-background transition-shadow",
        isFocused && "ring-2 ring-ring ring-offset-2",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}
