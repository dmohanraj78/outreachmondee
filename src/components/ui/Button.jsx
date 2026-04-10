import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-primary text-white hover:bg-primary/90 shadow-sm",
    accent: "bg-accent text-white hover:bg-accent/90 shadow-md",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
    ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
    link: "text-primary underline-offset-4 hover:underline",
  }
  
  const sizes = {
    default: "h-11 px-6 py-2",
    sm: "h-9 rounded-md px-4",
    lg: "h-14 rounded-xl px-10 text-base",
    icon: "h-11 w-11",
  }

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl text-sm font-bold tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
