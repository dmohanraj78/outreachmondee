import * as React from "react"
import { cn } from "../../lib/utils"

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "border-transparent bg-primary text-white",
    secondary: "border-transparent bg-slate-100 text-slate-700",
    destructive: "border-transparent bg-red-50 text-red-600",
    outline: "text-slate-600 border border-slate-200 bg-white",
    accent: "border-transparent bg-accent/10 text-accent",
    success: "border-transparent bg-emerald-50 text-emerald-600",
    warning: "border-transparent bg-amber-50 text-amber-600",
    info: "border-transparent bg-blue-50 text-blue-600",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
