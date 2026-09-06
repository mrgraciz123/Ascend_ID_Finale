import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border border-transparent px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[#B65F32] text-[#F5F1E8] hover:bg-[#8F4728]",
        secondary: "bg-[#191919] text-[#F5F1E8] border border-[#B65F32]/30 hover:border-[#B65F32]/60",
        destructive: "bg-[#9E2A2B]/20 text-[#E57373] border border-[#9E2A2B]/40",
        outline: "border border-[#B65F32]/30 text-[#F5F1E8]",
        ghost: "hover:bg-[#191919] text-[#8A847B] hover:text-[#F5F1E8]",
        link: "text-[#B65F32] underline-offset-4 hover:underline",
        verified: "bg-[#C9944A]/15 text-[#C9944A] border border-[#C9944A]/40 font-mono tracking-wider",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
 className,
 variant = "default",
 render,
 ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
 return useRender({
 defaultTagName: "span",
 props: mergeProps<"span">(
 {
 className: cn(badgeVariants({ variant }), className),
 },
 props
 ),
 render,
 state: {
 slot: "badge",
 variant,
 },
 })
}

export { Badge, badgeVariants }
