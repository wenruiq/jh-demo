import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { cva, type VariantProps } from "class-variance-authority"
import type {
  ComponentPropsWithoutRef,
  ComponentRef,
  ForwardRefExoticComponent,
  RefAttributes,
} from "react"
import { forwardRef } from "react"
import { cn } from "@/shared/lib/utils"

const toggleGroupVariants = cva("inline-flex items-center rounded-md border bg-muted p-0.5", {
  variants: {
    size: {
      default: "h-8",
      sm: "h-7",
      lg: "h-9",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

const toggleGroupItemVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 font-medium text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
  {
    variants: {
      size: {
        default: "h-7 px-3 text-sm",
        sm: "h-6 px-2 text-xs",
        lg: "h-8 px-4 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type ToggleGroupProps = ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleGroupVariants>

const ToggleGroup: ForwardRefExoticComponent<
  ToggleGroupProps & RefAttributes<ComponentRef<typeof ToggleGroupPrimitive.Root>>
> = forwardRef<ComponentRef<typeof ToggleGroupPrimitive.Root>, ToggleGroupProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <ToggleGroupPrimitive.Root
        className={cn(toggleGroupVariants({ size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

type ToggleGroupItemProps = ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleGroupItemVariants>

const ToggleGroupItem: ForwardRefExoticComponent<
  ToggleGroupItemProps & RefAttributes<ComponentRef<typeof ToggleGroupPrimitive.Item>>
> = forwardRef<ComponentRef<typeof ToggleGroupPrimitive.Item>, ToggleGroupItemProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <ToggleGroupPrimitive.Item
        className={cn(toggleGroupItemVariants({ size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
