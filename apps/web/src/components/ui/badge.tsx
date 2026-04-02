import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-[rgba(79,70,229,0.18)] text-[var(--primary)] [a&]:hover:bg-[rgba(79,70,229,0.24)]",
        secondary:
          "bg-white/7 text-secondary-foreground [a&]:hover:bg-white/10",
        destructive:
          "bg-[rgba(251,113,133,0.18)] text-rose-200 [a&]:hover:bg-[rgba(251,113,133,0.24)] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "bg-transparent text-muted-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] [a&]:hover:bg-white/5 [a&]:hover:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
