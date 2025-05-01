import { AlertTriangle, CircleX, Info } from "lucide-react";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

type CalloutProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "type" | "icon"
> & {
  title?: ReactNode;
  /**
   * @defaultValue info
   */
  type?: "info" | "warn" | "error";

  /**
   * Force an icon
   */
  icon?: ReactNode;
};

const calloutVariants = cva(
  "my-6 flex flex-row gap-2 rounded-lg bg-fd-card p-3 text-sm border",
  {
    variants: {
      type: {
        info: "border-sky-500/20 bg-sky-50/50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/5 dark:text-sky-200 dark:[--tw-prose-links-hover:theme(colors.sky.300)] dark:[--tw-prose-links:theme(colors.white)]",
        warn: "border-orange-500/20 bg-orange-50/50 text-orange-900 dark:border-orange-500/30 dark:bg-orange-500/5 dark:text-orange-200 dark:[--tw-prose-links-hover:theme(colors.orange.300)] dark:[--tw-prose-links:theme(colors.white)]",
        error:
          "border-red-500/20 bg-red-50/50 text-red-900 dark:border-red-500/30 dark:bg-red-500/5 dark:text-red-200 dark:[--tw-prose-links-hover:theme(colors.red.300)] dark:[--tw-prose-links:theme(colors.white)]",
      },
    },
  }
);

export const Callout = forwardRef<HTMLDivElement, CalloutProps>(
  ({ className, children, title, type = "info", icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          calloutVariants({
            type: type,
          }),
          className
        )}
        {...props}
      >
        {icon ??
          {
            info: <Info className="size-5 fill-blue-500 text-fd-card" />,
            warn: (
              <AlertTriangle className="size-5 fill-orange-500 text-fd-card" />
            ),
            error: <CircleX className="size-5 fill-red-500 text-fd-card" />,
          }[type]}
        <div className="min-w-0 flex flex-col gap-2 flex-1">
          {title ? <p className="font-medium !my-0">{title}</p> : null}
          <div className="text-fd-muted-foreground prose-no-margin empty:hidden">
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Callout.displayName = "Callout";
