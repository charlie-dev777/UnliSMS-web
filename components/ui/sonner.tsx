"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

// Toasts confirm actions bottom-right and auto-dismiss after 5 s.
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      duration={5000}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-[360px] max-w-[calc(100vw-32px)] items-start gap-3 rounded-xl border border-border bg-background px-4 py-3.5 font-sans text-foreground shadow-toast",
          title: "text-[13px] font-semibold",
          description: "text-xs text-muted-foreground",
          icon: "mt-0.5 [&_svg]:size-4",
          success: "[&_[data-icon]]:text-success-foreground",
          error: "[&_[data-icon]]:text-destructive",
          actionButton:
            "ml-auto h-7 shrink-0 cursor-pointer rounded-lg px-2.5 text-[13px] font-medium text-foreground hover:bg-muted",
        },
      }}
      {...props}
    />
  );
}
