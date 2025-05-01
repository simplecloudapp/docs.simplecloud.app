import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-[color,box-shadow] overflow-hidden font-mono",
  {
    variants: {
      variant: {
        small: "text-[0.625rem] font-semibold leading-6",
        medium: "rounded-lg px-1.5 ring-1 ring-inset",
      },
      color: {
        emerald:
          "text-emerald-500 dark:text-emerald-400 ring-emerald-300 dark:ring-emerald-400/30 bg-emerald-400/10",
        amber:
          "text-amber-500 dark:text-amber-400 ring-amber-300 dark:ring-amber-400/30 bg-amber-400/10",
        sky: "text-sky-500 dark:text-sky-400 ring-sky-300 dark:ring-sky-400/30 bg-sky-400/10",
        rose: "text-red-500 dark:text-rose-400 ring-rose-200 dark:ring-rose-500/20 bg-rose-50 dark:bg-rose-400/10",
        purple:
          "text-purple-500 dark:text-purple-400 ring-purple-200 dark:ring-purple-500/20 bg-purple-50 dark:bg-purple-400/10",
        zinc: "text-zinc-500 dark:text-zinc-400 ring-zinc-200 dark:ring-zinc-500/20 bg-zinc-50 dark:bg-zinc-400/10",
        // Original variants
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "text-foreground hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "medium",
      color: "emerald",
    },
  }
);

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
    children?: React.ReactNode;
  };

function Badge({
  className,
  variant,
  color,
  asChild = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, color }), className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

export { Badge, badgeVariants, type BadgeProps };
