"use client";

import { Check, Copy, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogClose, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ToastDemo() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast("Message queued", {
          description: "Sending to +63 917 555 0142 via Office Pixel 7.",
          icon: <Send />,
          action: { label: "Undo", onClick: () => {} },
        })
      }
    >
      Show toast
    </Button>
  );
}

export function ApiKeyDialogDemo() {
  const key = "usk_live_7Hq2…Xb9pR4";
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your new API key</DialogTitle>
          <DialogDescription>Copy it now. For security, you won’t be able to see this key again.</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input readOnly value={key} aria-label="API key" className="font-mono text-[12.5px]" />
          <Button variant="outline" onClick={() => toast("Copied to clipboard", { icon: <Check /> })}>
            <Copy />
            Copy
          </Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>I’ve saved my key</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
