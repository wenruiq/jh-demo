declare module "react-mentions" {
  import { ComponentType, ReactNode } from "react"

  export interface MentionProps {
    data: Array<{ id: string; display: string }>
    trigger?: string
    markup?: string
    displayTransform?: (id: string, display: string) => string
    style?: React.CSSProperties
    onAdd?: (id: string, display: string) => void
    onRemove?: (id: string, display: string) => void
  }

  export interface MentionsInputProps {
    value: string
    onChange?: (event: unknown, newValue: string) => void
    placeholder?: string
    style?: Record<string, unknown>
    disabled?: boolean
    children?: ReactNode
  }

  export const Mention: ComponentType<MentionProps>
  export const MentionsInput: ComponentType<MentionsInputProps>
}
