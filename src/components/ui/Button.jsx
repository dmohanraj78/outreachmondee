import * as React from "react"
import { cn } from "../../lib/utils"
import { Loader2 } from "lucide-react"

const Button = React.forwardRef(({ className, variant = "default", size = "default", loading = false, children, disabled, ...props }, ref) => {
  const variants = {
    default: "bg-primary text-white hover:bg-primary/90 shadow-sm",
    primary: "bg-primary text-white hover:bg-primary/90 shadow-sm",
    accent: "bg-accent text-white hover:bg-accent/90 shadow-md shadow-accent/10",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
    ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
    destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    link: "text-primary underline-offset-4 hover:underline",
  }
  
  const sizes = {
    default: "h-10 px-5 py-2",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-8 text-base",
    icon: "h-10 w-10",
  }

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
})
Button.displayName = "Button"

export { Button }
