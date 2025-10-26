import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "cricket" | "glass" | "default"
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "border-cricket-orange",
      cricket: "border-cricket-orange border-t-cricket-gold",
      glass: "border-cricket-white/30 border-t-cricket-orange",
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className || "")}
        {...props}
      >
        <div
          className={cn(
            "animate-spin rounded-full h-8 w-8 border-2",
            variants[variant]
          )}
        />
      </div>
    )
  }
)
Loading.displayName = "Loading"

export { Loading }
