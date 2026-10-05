"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Plus } from "lucide-react";
import { createApiKey, type CreateKeyField, type IssuedKey } from "@/lib/api-keys/actions";
import { API_KEY_SCOPES, DEFAULT_SCOPES, NAME_MAX } from "@/lib/api-keys/scopes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SecretReveal } from "./secret-reveal";

/**
 * Create-key form in a dialog, then the one-time key display in the same dialog. The
 * list refreshes from the API when the dialog closes, not while the key is on screen.
 */
export function CreateApiKeyDialog({ label = "Create API key" }: { label?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(DEFAULT_SCOPES);
  const [errors, setErrors] = useState<Partial<Record<CreateKeyField, string>>>({});
  const [issued, setIssued] = useState<IssuedKey | null>(null);
  const [pending, startTransition] = useTransition();

  const reset = () => {
    setName("");
    setScopes(DEFAULT_SCOPES);
    setErrors({});
    setIssued(null);
  };

  const close = () => {
    const created = issued !== null;
    setOpen(false);
    reset();
    if (created) router.refresh();
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;
    startTransition(async () => {
      const result = await createApiKey({ name, scopes });
      if (result.ok) {
        setErrors({});
        setIssued(result.issued);
      } else {
        setErrors(result.errors);
      }
    });
  };

  const toggleScope = (scope: string, checked: boolean) =>
    setScopes((current) => (checked ? [...current, scope] : current.filter((s) => s !== scope)));

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setOpen(true);
        else if (!pending && !issued) close();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent
        // While the key is shown, only the explicit button closes the dialog, so a stray
        // click or Escape can't throw away a key that hasn't been copied.
        onInteractOutside={(e) => issued && e.preventDefault()}
        onEscapeKeyDown={(e) => issued && e.preventDefault()}
      >
        {issued ? (
          <SecretReveal secret={issued.secret} name={issued.key.name} onDone={close} />
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Create API key</DialogTitle>
              <DialogDescription>Applications use API keys to call the UnliSMS API for your organization.</DialogDescription>
            </DialogHeader>

            {errors.form && (
              <Alert variant="danger">
                <AlertCircle aria-hidden />
                <AlertDescription>{errors.form}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="api-key-name">Name</Label>
              <Input
                id="api-key-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={NAME_MAX + 20}
                placeholder="e.g. Billing reminders"
                autoComplete="off"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "api-key-name-error" : "api-key-name-hint"}
                disabled={pending}
              />
              {errors.name ? (
                <p id="api-key-name-error" className="m-0 text-xs text-destructive">
                  {errors.name}
                </p>
              ) : (
                <p id="api-key-name-hint" className="m-0 text-xs text-muted-foreground">
                  So you can tell your keys apart. Up to {NAME_MAX} characters.
                </p>
              )}
            </div>

            <fieldset className="m-0 flex flex-col gap-2 border-0 p-0" aria-describedby={errors.scopes ? "api-key-scopes-error" : undefined}>
              <legend className="mb-1 p-0 text-sm font-medium">Permissions</legend>
              {API_KEY_SCOPES.map((scope) => (
                <div key={scope.value} className="flex items-start gap-2.5">
                  <Checkbox
                    id={`scope-${scope.value}`}
                    checked={scopes.includes(scope.value)}
                    onCheckedChange={(checked) => toggleScope(scope.value, checked === true)}
                    disabled={pending}
                    className="mt-0.5"
                  />
                  <Label htmlFor={`scope-${scope.value}`} className="flex flex-col items-start gap-0.5 font-normal">
                    <span className="font-medium">
                      {scope.label} <span className="font-mono text-xs text-muted-foreground">{scope.value}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{scope.description}</span>
                  </Label>
                </div>
              ))}
              {errors.scopes && (
                <p id="api-key-scopes-error" className="m-0 text-xs text-destructive">
                  {errors.scopes}
                </p>
              )}
            </fieldset>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={pending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={pending} aria-busy={pending}>
                {pending ? "Creating…" : "Create key"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
