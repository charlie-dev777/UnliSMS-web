"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Check, Copy } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * One-time display of a new API key, inside an open dialog. The key exists only in the
 * parent's React state: it's never written to storage, the URL or logs, and it's dropped
 * when the dialog closes. The API can't return it again.
 */
export function SecretReveal({ secret, name, onDone }: { secret: string; name: string; onDone: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopy("copied");
    } catch {
      inputRef.current?.select();
      setCopy("failed");
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Copy your new API key</DialogTitle>
        <DialogDescription>
          <span className="font-medium text-foreground">{name}</span> is ready to use.
        </DialogDescription>
      </DialogHeader>
      <Alert variant="warning">
        <AlertTriangle aria-hidden />
        <AlertDescription>Copy this API key now. You won’t be able to view it again.</AlertDescription>
      </Alert>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-api-key">API key</Label>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            id="new-api-key"
            readOnly
            value={secret}
            autoComplete="off"
            spellCheck={false}
            onFocus={(e) => e.currentTarget.select()}
            className="font-mono text-[13px] sm:text-[13px]"
          />
          <Button type="button" variant="outline" onClick={copyKey} className="shrink-0">
            {copy === "copied" ? <Check /> : <Copy />}
            {copy === "copied" ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="m-0 text-xs text-muted-foreground" aria-live="polite">
          {copy === "failed"
            ? "Your browser blocked copying. The key is selected — copy it with your keyboard."
            : "Send it as a Bearer token: Authorization: Bearer <key>. Store it in a secret manager, not in your code."}
        </p>
      </div>
      <DialogFooter>
        <Button type="button" onClick={onDone}>
          I’ve copied the key
        </Button>
      </DialogFooter>
    </>
  );
}
