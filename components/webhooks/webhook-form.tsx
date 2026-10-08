"use client";

import { startTransition, useId, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Info, Loader2, RotateCw } from "lucide-react";
import type { GatewayWebhook } from "@/lib/types";
import { saveGatewayWebhook, type WebhookField } from "@/lib/webhooks/actions";
import { DEFAULT_EVENTS, isWebhookEventName, SECRET_MAX, signingSecretError, WEBHOOK_EVENTS, webhookUrlError } from "@/lib/webhooks/config";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Errors = Partial<Record<WebhookField, string>>;

const sameEvents = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((e) => b.includes(e));

/**
 * Edits one gateway's webhook. Starts from the API's configuration; the page remounts it
 * (keyed by version) after every save or reload, so it never keeps its own copy. The
 * replacement signing secret only lives in this component's state until the save.
 */
export function WebhookForm({ webhook }: { webhook: GatewayWebhook }) {
  const id = useId();
  const router = useRouter();
  const [url, setUrl] = useState(webhook.url ?? "");
  const [enabled, setEnabled] = useState(webhook.configured ? webhook.enabled : true);
  // Only the events the portal offers; anything else the API holds is dropped on the next save.
  const [events, setEvents] = useState<string[]>(() => {
    const offered = webhook.configured ? webhook.events.filter(isWebhookEventName) : [];
    return offered.length > 0 ? offered : DEFAULT_EVENTS;
  });
  const [secret, setSecret] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [stale, setStale] = useState(false);
  const [pending, setPending] = useState(false);
  const [reloading, startReload] = useTransition();
  // Blocks a second submit (double click, Enter + click) before `pending` re-renders.
  const inFlight = useRef(false);

  /** Hides a field's error (and the form-level one) once the user edits it. */
  const clear = (field: WebhookField) =>
    setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key !== field && key !== "form")));

  /** An existing webhook with its URL cleared: saving removes it (the API clears the URL). */
  const removing = webhook.configured && url.trim() === "";
  const androidMismatch = !sameEvents(events, DEFAULT_EVENTS);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    const found: Errors = {};
    if (url.trim() || !webhook.configured) {
      const urlError = webhookUrlError(url);
      if (urlError) found.url = urlError;
    }
    if (events.length === 0 && !removing) found.events = "Choose at least one event.";
    const secretError = signingSecretError(secret);
    if (secretError) found.signingSecret = secretError;
    setErrors(found);
    setStale(false);
    if (Object.keys(found).length > 0) return;

    inFlight.current = true;
    setPending(true);
    startTransition(async () => {
      try {
        // On success the action redirects and the page reloads from the API.
        const result = await saveGatewayWebhook({
          gatewayId: webhook.gatewayId,
          loadedVersion: webhook.version,
          url,
          enabled,
          // The API requires events even when removing; they don't matter then.
          events: removing && events.length === 0 ? DEFAULT_EVENTS : events,
          signingSecret: secret,
        });
        if (result) {
          setErrors(result.errors);
          setStale(result.staleVersion !== undefined);
        }
      } catch {
        setErrors({ form: "Couldn’t reach the portal, so your changes may not have been saved. Reload the page to check." });
      } finally {
        inFlight.current = false;
        setPending(false);
      }
    });
  };

  const toggle = (name: string, checked: boolean) => {
    setEvents((current) => (checked ? WEBHOOK_EVENTS.map((e) => e.name).filter((n) => n === name || current.includes(n)) : current.filter((n) => n !== name)));
    clear("events");
  };

  const error = (field: WebhookField) =>
    errors[field] ? (
      <p id={`${id}-${field}-error`} className="m-0 text-xs text-destructive">
        {errors[field]}
      </p>
    ) : null;
  const described = (field: WebhookField, hint?: string) =>
    errors[field] ? { "aria-invalid": true as const, "aria-describedby": `${id}-${field}-error` } : hint ? { "aria-describedby": hint } : {};

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5" aria-busy={pending}>
      {errors.form && (
        <Alert variant="danger">
          <AlertCircle aria-hidden />
          <AlertDescription className="flex flex-col items-start gap-2">
            <span>{errors.form}</span>
            {stale && (
              <Button type="button" variant="outline" size="sm" disabled={reloading} onClick={() => startReload(() => router.replace(`/webhooks?gateway=${encodeURIComponent(webhook.gatewayId)}`))}>
                <RotateCw />
                Load latest settings
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-url`}>Webhook URL</Label>
        <Input
          id={`${id}-url`}
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            clear("url");
          }}
          placeholder="https://example.com/webhooks/unlisms"
          autoComplete="off"
          spellCheck={false}
          disabled={pending}
          className="font-mono text-[13px] sm:text-[13px]"
          {...described("url", `${id}-url-hint`)}
        />
        {error("url") ?? (
          <p id={`${id}-url-hint`} className="m-0 text-xs text-muted-foreground">
            {removing
              ? "Saving with no URL removes this webhook. Events stop, and the URL is cleared for the portal and the app."
              : "Must be an https:// address that’s reachable from the internet."}
          </p>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 rounded-lg border border-border px-3.5 py-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor={`${id}-enabled`}>Send events</Label>
          <p className="m-0 text-xs text-muted-foreground">
            {removing
              ? "Nothing is sent once the webhook is removed."
              : enabled
                ? "Events are sent to this URL."
                : "Nothing is sent until you turn this on. The URL is kept."}
          </p>
        </div>
        <Switch id={`${id}-enabled`} checked={enabled && !removing} onCheckedChange={setEnabled} disabled={pending || removing} />
      </div>

      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0" {...described("events")}>
        <legend className="mb-1 p-0 text-sm font-medium">Events</legend>
        <div className="flex flex-col gap-2.5">
          {WEBHOOK_EVENTS.map((e) => (
            <div key={e.name} className="flex items-start gap-2.5">
              <Checkbox
                id={`${id}-${e.name}`}
                checked={events.includes(e.name)}
                onCheckedChange={(checked) => toggle(e.name, checked === true)}
                disabled={pending || removing}
                className="mt-0.5"
              />
              <Label htmlFor={`${id}-${e.name}`} className="flex min-w-0 flex-col items-start gap-0.5 font-normal">
                <span className="flex flex-wrap items-baseline gap-x-1.5">
                  {e.label}
                  <span className="font-mono text-[11px] text-muted-foreground">{e.name}</span>
                </span>
                <span className="text-xs text-muted-foreground">{e.description}</span>
              </Label>
            </div>
          ))}
        </div>
        {error("events")}
        <p className="m-0 flex gap-2 text-xs text-muted-foreground">
          <Info className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>
            Saving webhook settings again in the Android app may replace your selected event subscriptions
            {androidMismatch ? " with all three events." : "."}
          </span>
        </p>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-secret`}>{webhook.hasSigningSecret ? "Replace signing secret" : "Signing secret"} (optional)</Label>
        <Input
          id={`${id}-secret`}
          type="password"
          value={secret}
          onChange={(e) => {
            setSecret(e.target.value);
            clear("signingSecret");
          }}
          maxLength={SECRET_MAX + 1}
          autoComplete="new-password"
          spellCheck={false}
          disabled={pending}
          className="font-mono text-[13px] sm:text-[13px]"
          {...described("signingSecret", `${id}-secret-hint`)}
        />
        {error("signingSecret") ?? (
          <p id={`${id}-secret-hint`} className="m-0 text-xs text-muted-foreground">
            {webhook.hasSigningSecret
              ? "A secret is set. It’s never shown. Leave this blank to keep it, or enter 16–512 characters to replace it."
              : "Leave blank and UnliSMS creates one you can’t view. To verify signatures, enter your own 16–512 characters."}{" "}
            Each delivery is signed in the <span className="font-mono">x-onsim-signature-256</span> header as{" "}
            <span className="font-mono">sha256=</span>HMAC-SHA256 of the request body.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          {pending ? "Saving…" : removing ? "Remove webhook" : "Save webhook"}
        </Button>
      </div>
    </form>
  );
}
