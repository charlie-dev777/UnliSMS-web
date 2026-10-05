"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Ban, RefreshCw } from "lucide-react";
import { revokeApiKey, rotateApiKey, type IssuedKey } from "@/lib/api-keys/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SecretReveal } from "./secret-reveal";

type KeyRef = { id: string; name: string; prefix: string };

/** Revokes a key after confirmation; the list refreshes from the API once it succeeds. */
export function RevokeKeyButton({ apiKey }: { apiKey: KeyRef }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      const result = await revokeApiKey(apiKey.id);
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
        <Button variant="outline" size="sm">
          <Ban />
          Revoke
          <span className="sr-only"> {apiKey.name}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke API key?</DialogTitle>
          <DialogDescription>
            Applications using <span className="font-medium text-foreground">{apiKey.name}</span> (
            <span className="font-mono">{apiKey.prefix}…</span>) will stop authenticating immediately. This can’t be undone.
          </DialogDescription>
        </DialogHeader>
        <p className="m-0 text-xs text-muted-foreground">Your gateway phones aren’t affected: they sign in with their own device credentials.</p>
        {error && (
          <Alert variant="danger">
            <AlertCircle aria-hidden />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={pending}>
              Keep key
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={confirm} disabled={pending} aria-busy={pending}>
            {pending ? "Revoking…" : "Revoke key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Rotates a key after confirmation, then shows the replacement once. The list refreshes
 * when the dialog closes: this row becomes revoked, and refreshing earlier would unmount
 * the dialog with the new key still on screen.
 */
export function RotateKeyButton({ apiKey }: { apiKey: KeyRef }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issued, setIssued] = useState<IssuedKey | null>(null);
  const [pending, startTransition] = useTransition();

  const close = () => {
    const rotated = issued !== null;
    setOpen(false);
    setIssued(null);
    setError(null);
    if (rotated) router.refresh();
  };

  const confirm = () =>
    startTransition(async () => {
      const result = await rotateApiKey(apiKey.id);
      if (result.ok) setIssued(result.data);
      else {
        setError(result.error);
        router.refresh();
      }
    });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setError(null);
          setOpen(true);
        } else if (!pending && !issued) close();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw />
          Rotate
          <span className="sr-only"> {apiKey.name}</span>
        </Button>
      </DialogTrigger>
      <DialogContent onInteractOutside={(e) => issued && e.preventDefault()} onEscapeKeyDown={(e) => issued && e.preventDefault()}>
        {issued ? (
          <SecretReveal secret={issued.secret} name={issued.key.name} onDone={close} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Rotate API key?</DialogTitle>
              <DialogDescription>
                A new key replaces <span className="font-medium text-foreground">{apiKey.name}</span> (
                <span className="font-mono">{apiKey.prefix}…</span>) with the same permissions. The current key stops authenticating
                immediately, so update your applications right after.
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
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={confirm} disabled={pending} aria-busy={pending}>
                {pending ? "Rotating…" : "Rotate key"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
