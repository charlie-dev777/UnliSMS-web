"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarX } from "lucide-react";
import { cancelScheduledMessage } from "@/lib/messages/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/**
 * Cancels a scheduled SMS after confirmation. The API only allows it while the message is
 * still `scheduled` and its time hasn't passed; anything else comes back as an error here.
 */
export function CancelScheduledButton({
  messageId,
  recipient,
  when,
  recurring,
  size = "sm",
}: {
  messageId: string;
  recipient: string;
  when: string;
  recurring: boolean;
  size?: "sm" | "default";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      const result = await cancelScheduledMessage(messageId);
      if (result.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
        router.refresh();
      }
    });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        setOpen(next);
        if (next) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size={size}>
          <CalendarX />
          Cancel
          <span className="sr-only"> scheduled SMS to {recipient}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel scheduled SMS?</DialogTitle>
          <DialogDescription>
            The SMS to <span className="font-mono">{recipient}</span> scheduled for {when}{" "}
            {recurring ? "and all of its future repeats won’t be sent." : "won’t be sent."} This can’t be undone.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="danger">
            <AlertCircle aria-hidden />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={pending}>
              Keep scheduled
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={confirm} disabled={pending} aria-busy={pending}>
            {pending ? "Cancelling…" : "Cancel SMS"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
