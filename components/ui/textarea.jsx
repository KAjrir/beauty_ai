import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-12 max-h-50 w-full rounded-md bg-transparent py-3 outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-[22px]",
        className
      )}
      {...props} />
  );
}

export { Textarea }
