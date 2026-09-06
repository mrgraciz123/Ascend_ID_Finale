import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
 "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
 {
  variants: {
    variant: {
      default: "bg-[#B65F32] text-[#F5F1E8] hover:bg-[#8F4728] shadow-sm active:bg-[#70361C]",
      outline:
        "border border-[#B65F32]/40 bg-[#0D0D0D] text-[#F5F1E8] hover:bg-[#191919] hover:border-[#B65F32] active:bg-[#141414]",
      secondary:
        "bg-[#191919] text-[#F5F1E8] border border-white/10 hover:bg-[#241814] hover:border-[#B65F32]/40",
      ghost:
        "hover:bg-[#191919] hover:text-[#F5F1E8] text-[#8A847B]",
      destructive:
        "bg-[#9E2A2B]/20 text-[#E57373] border border-[#9E2A2B]/40 hover:bg-[#9E2A2B]/30",
      link: "text-[#B65F32] underline-offset-4 hover:underline",
      gold: "bg-[#C9944A] text-[#0D0D0D] font-medium hover:bg-[#B58238]",
    },
 size: {
 default:
 "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
 xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
 sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
 lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
 icon: "size-8",
 "icon-xs":
 "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
 "icon-sm":
 "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
 "icon-lg": "size-9",
 },
 },
 defaultVariants: {
 variant: "default",
 size: "default",
 },
 }
)

function Button({
 className,
 variant = "default",
 size = "default",
 ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
 return (
 <ButtonPrimitive
 data-slot="button"
 className={cn(buttonVariants({ variant, size, className }))}
 {...props}
 />
 )
}

export { Button, buttonVariants }
