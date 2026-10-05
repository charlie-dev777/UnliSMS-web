"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, CalendarClock, Info, Loader2, Send } from "lucide-react";
import type { GatewayPresence } from "@/lib/types";
import { sendMessage, type ComposeField, type ComposeMode, type ComposeState, type ComposeValues } from "@/lib/messages/actions";
import {
  checkSchedule,
  isSendableSlot,
  MAX_MESSAGE_LENGTH,
  messageError,
  messageLength,
  parseWallTime,
  phoneError,
  simValue,
  todayIn,
} from "@/lib/messages/compose";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatWallTimeLong, utcOffsetLabel } from "./message-format";

/** What the form needs from each live gateway (`GET /v1/gateways`). */
export type ComposeGateway = {
  publicGatewayId: string;
  label: string;
  presence: GatewayPresence;
  sims: { slotNumber: number; phoneNumber: string | null; carrierName: string | null; isDefaultOutbound: boolean }[];
};

type Errors = NonNullable<ComposeState["errors"]>;

// The browser's IANA timezone. Unknown during server rendering, so it renders after hydration.
const subscribeNever = () => () => {};
const deviceTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
const noTimeZone = () => "";

const newKey = () => crypto.randomUUID();

/** The SIM to preselect: the gateway's default if it's sendable, else its first sendable SIM. */
function defaultSim(gateway: ComposeGateway | undefined) {
  const sendable = gateway?.sims.filter((s) => isSendableSlot(s.slotNumber)) ?? [];
  const pick = sendable.find((s) => s.isDefaultOutbound) ?? sendable[0];
  return pick && isSendableSlot(pick.slotNumber) ? simValue(pick.slotNumber) : "";
}

export function ComposeForm({
  gateways,
  initialMode,
  initialIdempotencyKey,
}: {
  gateways: ComposeGateway[];
  initialMode: ComposeMode;
  initialIdempotencyKey: string;
}) {
  const id = useId();
  const timeZone = useSyncExternalStore(subscribeNever, deviceTimeZone, noTimeZone);
  const first = gateways.length === 1 ? gateways[0] : undefined;

  const [values, setValues] = useState<ComposeValues>({
    mode: initialMode,
    to: "",
    message: "",
    gateway: first?.publicGatewayId ?? "",
    sim: defaultSim(first),
    date: "",
    time: "",
    timeZone: "",
  });
  // Sent as Idempotency-Key. Any edit makes a new one; resubmitting unchanged values
  // (e.g. after a timeout) reuses it, so the API returns the first message, not a second.
  const [idempotencyKey, setIdempotencyKey] = useState(initialIdempotencyKey);
  const [clientErrors, setClientErrors] = useState<Errors | null>(null);
  const [state, formAction, pending] = useActionState(sendMessage, { values });
  // Errors for fields edited since the last check are hidden until the next submit.
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());
  const [checkedState, setCheckedState] = useState(state);
  if (checkedState !== state) {
    setCheckedState(state);
    setDismissed(new Set());
  }
  const errors: Errors = Object.fromEntries(
    Object.entries(clientErrors ?? state.errors ?? {}).filter(([field]) => !dismissed.has(field)),
  );

  const gateway = gateways.find((g) => g.publicGatewayId === values.gateway);
  const sendableSims = gateway?.sims.filter((s) => isSendableSlot(s.slotNumber)) ?? [];
  const scheduling = values.mode === "schedule";

  const dismiss = (...fields: string[]) => setDismissed((d) => new Set([...d, ...fields, "form"]));

  const update = <K extends keyof ComposeValues>(key: K, value: ComposeValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setIdempotencyKey(newKey());
    dismiss(key, ...(key === "date" || key === "time" ? ["date", "time"] : []));
  };

  const chooseGateway = (publicGatewayId: string) => {
    const next = gateways.find((g) => g.publicGatewayId === publicGatewayId);
    setValues((v) => ({ ...v, gateway: publicGatewayId, sim: defaultSim(next) }));
    setIdempotencyKey(newKey());
    dismiss("gateway", "sim");
  };

  // Blocks a second submit (double click, Enter + click) before `pending` re-renders.
  // The idempotency key would make a repeat harmless anyway.
  const inFlight = useRef(false);
  useEffect(() => {
    inFlight.current = false;
  }, [state]);

  /**
   * Client-side checks first; the server action repeats them and the API has the final say.
   * Submits from state rather than `<form action>`, which resets the form afterwards (and
   * with it the gateway picker) even when the server returned errors.
   */
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current || pending) return;
    const found: Errors = {};
    const phone = phoneError(values.to);
    if (phone) found.to = phone;
    const message = messageError(values.message);
    if (message) found.message = message;
    if (!gateway) found.gateway = "Choose a gateway.";
    else if (!values.sim) found.sim = sendableSims.length ? "Choose a SIM." : "This gateway has no SIM that can send.";
    if (scheduling) {
      const schedule = checkSchedule(values.date, values.time, timeZone);
      if (!schedule.ok) found[schedule.field] = schedule.error;
    }
    setDismissed(new Set());
    if (Object.keys(found).length > 0) {
      setClientErrors(found);
      return;
    }
    setClientErrors(null);

    const formData = new FormData();
    for (const [key, value] of Object.entries({ ...values, timeZone, idempotencyKey })) formData.set(key, value);
    inFlight.current = true;
    startTransition(() => formAction(formData));
  };

  const fieldError = (field: ComposeField) =>
    errors[field] ? (
      <span id={`${id}-${field}-error`} className="text-xs text-destructive">
        {errors[field]}
      </span>
    ) : null;
  const invalid = (field: ComposeField) =>
    errors[field] ? { "aria-invalid": true as const, "aria-describedby": `${id}-${field}-error` } : {};

  const length = messageLength(values.message);
  const blocked = !!gateway && sendableSims.length === 0;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5" aria-busy={pending}>

      <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
        <legend className="mb-1.5 text-[13px] font-medium">When</legend>
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1" role="radiogroup" aria-label="When to send">
          {(
            [
              ["now", "Send now", Send],
              ["schedule", "Schedule", CalendarClock],
            ] as const
          ).map(([mode, label, Icon]) => (
            <label
              key={mode}
              className={cn(
                "flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md text-[13px] font-medium text-muted-foreground has-focus-visible:outline-2 has-focus-visible:outline-ring",
                values.mode === mode && "bg-background text-foreground shadow-sm",
              )}
            >
              <input
                type="radio"
                name="modeChoice"
                value={mode}
                checked={values.mode === mode}
                onChange={() => update("mode", mode)}
                className="sr-only"
              />
              <Icon className="size-4" aria-hidden />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-5 min-[641px]:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor={`${id}-gateway`}>Gateway</Label>
          <Select name="gateway" value={values.gateway} onValueChange={chooseGateway}>
            <SelectTrigger id={`${id}-gateway`} className="h-10" {...invalid("gateway")}>
              <SelectValue placeholder="Choose a gateway" />
            </SelectTrigger>
            <SelectContent>
              {gateways.map((g) => (
                <SelectItem key={g.publicGatewayId} value={g.publicGatewayId}>
                  {g.label}
                  {g.presence !== "online" && <span className="text-muted-foreground"> · {g.presence === "offline" ? "Offline" : "Not yet seen"}</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldError("gateway")}
          {gateway && gateway.presence !== "online" && (
            <span className="flex gap-1.5 text-xs text-warning-ink">
              <Info className="mt-px size-3.5 shrink-0" aria-hidden />
              This phone isn’t online right now. The SMS goes out only after it reconnects to UnliSMS.
            </span>
          )}
        </div>

        <fieldset className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0" aria-describedby={errors.sim ? `${id}-sim-error` : undefined}>
          <legend className="mb-1.5 text-[13px] font-medium">SIM</legend>
          {!gateway ? (
            <p className="m-0 flex min-h-10 items-center text-[13px] text-muted-foreground">Choose a gateway to see its SIMs.</p>
          ) : gateway.sims.length === 0 ? (
            <p className="m-0 text-[13px] text-muted-foreground">This phone hasn’t reported an active SIM, so it can’t send SMS.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {gateway.sims.map((sim) => {
                const sendable = isSendableSlot(sim.slotNumber);
                const value = isSendableSlot(sim.slotNumber) ? simValue(sim.slotNumber) : `slot${sim.slotNumber}`;
                return (
                  <label
                    key={sim.slotNumber}
                    className={cn(
                      "flex min-h-10 items-start gap-3 rounded-lg border border-input px-3 py-2 has-focus-visible:outline-2 has-focus-visible:outline-ring",
                      sendable ? "cursor-pointer has-checked:border-brand has-checked:bg-accent" : "cursor-not-allowed bg-muted text-muted-foreground",
                    )}
                  >
                    <input
                      type="radio"
                      name="sim"
                      value={value}
                      disabled={!sendable}
                      checked={sendable && values.sim === value}
                      onChange={() => update("sim", value)}
                      className="mt-1 accent-brand"
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[13px] font-medium">
                        SIM {sim.slotNumber}
                        {sim.phoneNumber && <span className="font-mono font-normal break-all"> · {sim.phoneNumber}</span>}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {sendable
                          ? [sim.carrierName ?? "Carrier unknown", sim.isDefaultOutbound ? "Default for sending" : null].filter(Boolean).join(" · ")
                          : "Can’t send from this slot — UnliSMS sends from SIM 1 or SIM 2 only."}
                      </span>
                    </span>
                  </label>
                );
              })}
              {sendableSims.length === 0 && (
                <p className="m-0 text-xs text-muted-foreground">None of this phone’s active SIMs are in slot 1 or 2, so it can’t send SMS.</p>
              )}
            </div>
          )}
          {fieldError("sim")}
        </fieldset>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-to`}>Recipient</Label>
        <Input
          id={`${id}-to`}
          name="to"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          placeholder="+63 917 555 0142"
          className="h-10 font-mono"
          value={values.to}
          onChange={(e) => update("to", e.target.value)}
          {...invalid("to")}
        />
        {fieldError("to") ?? <span className="text-xs text-muted-foreground">International format with the country code.</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor={`${id}-message`}>Message</Label>
          <span className={cn("num text-xs", length > MAX_MESSAGE_LENGTH ? "text-destructive" : "text-muted-foreground")} aria-live="polite">
            {formatNumber(length)} / {formatNumber(MAX_MESSAGE_LENGTH)}
          </span>
        </div>
        <Textarea
          id={`${id}-message`}
          name="message"
          className="h-36"
          placeholder="Type your message"
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          {...invalid("message")}
        />
        {fieldError("message") ?? (
          <span className="text-xs text-muted-foreground">Long messages are split into several SMS by the phone and may cost more to send.</span>
        )}
      </div>

      {scheduling && <ScheduleFields id={id} values={values} timeZone={timeZone} errors={errors} update={update} invalid={invalid} />}

      {errors.form && (
        <Alert variant="danger">
          <AlertCircle aria-hidden />
          <AlertDescription>{errors.form}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col-reverse gap-2 min-[481px]:flex-row min-[481px]:justify-end">
        <Button asChild variant="outline" size="lg">
          <Link href="/messages">Cancel</Link>
        </Button>
        <Button type="submit" size="lg" disabled={pending || blocked || (scheduling && !timeZone)} aria-disabled={pending}>
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
          Send
        </Button>
      </div>
      <p className="sr-only" aria-live="polite">
        {pending ? (scheduling ? "Scheduling your SMS…" : "Sending your SMS…") : ""}
      </p>
    </form>
  );
}

function ScheduleFields({
  id,
  values,
  timeZone,
  errors,
  update,
  invalid,
}: {
  id: string;
  values: ComposeValues;
  timeZone: string;
  errors: Errors;
  update: <K extends keyof ComposeValues>(key: K, value: ComposeValues[K]) => void;
  invalid: (field: ComposeField) => object;
}) {
  const wall = parseWallTime(values.date, values.time);
  const check = wall && timeZone ? checkSchedule(values.date, values.time, timeZone) : null;
  const error = (field: ComposeField) =>
    errors[field] ? (
      <span id={`${id}-${field}-error`} className="text-xs text-destructive">
        {errors[field]}
      </span>
    ) : null;

  return (
    <fieldset className="m-0 flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-4">
      <legend className="sr-only">Schedule</legend>
      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor={`${id}-date`}>Date</Label>
          <Input
            id={`${id}-date`}
            name="date"
            type="date"
            className="h-10"
            min={timeZone ? todayIn(timeZone) : undefined}
            value={values.date}
            onChange={(e) => update("date", e.target.value)}
            {...invalid("date")}
          />
          {error("date")}
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor={`${id}-time`}>Time</Label>
          <Input
            id={`${id}-time`}
            name="time"
            type="time"
            className="h-10"
            value={values.time}
            onChange={(e) => update("time", e.target.value)}
            {...invalid("time")}
          />
          {error("time")}
        </div>
      </div>

      <div className="flex gap-2 text-xs text-muted-foreground" id={`${id}-tz`}>
        <Info className="mt-px size-3.5 shrink-0" aria-hidden />
        {timeZone ? (
          <span>
            Times are in your device’s timezone, <span className="font-medium text-foreground">{timeZone}</span>
            {check?.ok && ` (${utcOffsetLabel(check.epochMs, timeZone)})`}. UnliSMS keeps this wall-clock time and timezone.
          </span>
        ) : (
          <span>Detecting your timezone…</span>
        )}
      </div>
      {error("timeZone")}

      {wall && check?.ok && (
        <p className="m-0 text-[13px] font-medium" aria-live="polite">
          Sends {formatWallTimeLong(wall)} ({timeZone})
        </p>
      )}
      {wall && check && !check.ok && !errors[check.field] && (
        <p className="m-0 text-xs text-destructive" aria-live="polite">
          {check.error}
        </p>
      )}
    </fieldset>
  );
}
