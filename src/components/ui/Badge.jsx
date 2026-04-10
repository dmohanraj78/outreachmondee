import * as React from "react"
import { cn } from "../../lib/utils"

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "border-transparent bg-primary text-white hover:bg-primary/80",
    secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200",
    destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
    outline: "text-slate-950 border border-slate-200",
    accent: "border-transparent bg-accent text-white hover:bg-accent/80",
    success: "border-transparent bg-emerald-500 text-white hover:bg-emerald-600",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-black transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase tracking-widest",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
